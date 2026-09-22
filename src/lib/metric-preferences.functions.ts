import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { defaultMetrics, metricIds, type MetricId } from "@/lib/metrics";

const practiceInput = z.object({ practiceId: z.string().min(1) });
const saveInput = practiceInput.extend({
  selectedMetrics: z.array(z.enum(metricIds)).min(1),
  selectedOutcomes: z.array(z.string().min(1)).max(5),
});

export type MetricPreferences = {
  selectedMetrics: MetricId[];
  selectedOutcomes: string[];
};

export const getMetricPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => practiceInput.parse(data))
  .handler(async ({ context, data }): Promise<MetricPreferences> => {
    const { data: row, error } = await context.supabase
      .from("practice_metric_preferences")
      .select("selected_metrics, selected_outcomes")
      .eq("practice_id", data.practiceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      selectedMetrics: ((row?.selected_metrics as MetricId[] | undefined) ?? defaultMetrics),
      selectedOutcomes: ((row?.selected_outcomes as string[] | undefined) ?? []),
    };
  });

export const saveMetricPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveInput.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("practice_metric_preferences").upsert(
      {
        practice_id: data.practiceId,
        selected_metrics: data.selectedMetrics,
        selected_outcomes: data.selectedOutcomes,
      },
      { onConflict: "practice_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });