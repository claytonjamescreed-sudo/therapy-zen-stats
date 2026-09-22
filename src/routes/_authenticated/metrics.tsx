import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { usePractice } from "@/lib/practice-store";
import { getMetricPreferences, saveMetricPreferences } from "@/lib/metric-preferences.functions";
import { defaultMetrics, metricLabels, outcomeOptions, type MetricId } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/metrics")({
  head: () => ({ meta: [
    { title: "Your Metrics — Pepper | HPC Billing" },
    { name: "description", content: "Choose the outcomes that matter now and tailor the practice dashboard." },
    { property: "og:title", content: "Your Metrics — Pepper | HPC Billing" },
    { property: "og:description", content: "Personalize a practice dashboard using standard available metrics." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: MetricsPage,
});

function MetricsPage() {
  const { practice } = usePractice();
  const load = useServerFn(getMetricPreferences);
  const save = useServerFn(saveMetricPreferences);
  const queryClient = useQueryClient();
  const queryKey = ["metric-preferences", practice.id];
  const preferences = useQuery({ queryKey, queryFn: () => load({ data: { practiceId: practice.id } }) });
  const [outcomes, setOutcomes] = useState<string[]>([]);
  useEffect(() => { if (preferences.data) setOutcomes(preferences.data.selectedOutcomes); }, [preferences.data]);
  const metrics = useMemo(() => {
    if (!outcomes.length) return preferences.data?.selectedMetrics ?? defaultMetrics;
    return Array.from(new Set(outcomeOptions.filter((o) => outcomes.includes(o.id)).flatMap((o) => o.metrics)));
  }, [outcomes, preferences.data]);
  const mutation = useMutation({
    mutationFn: () => save({ data: { practiceId: practice.id, selectedMetrics: metrics, selectedOutcomes: outcomes } }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey }); toast.success("Dashboard metrics saved"); },
    onError: (error: Error) => toast.error(error.message),
  });
  return <AppShell>
    <div className="mb-6"><h1 className="text-2xl font-semibold text-foreground">What numbers matter right now?</h1><p className="text-sm text-muted-foreground">Choose what {practice.name} wants to improve over the next 90 days.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-3">{outcomeOptions.map((outcome) => {
        const selected = outcomes.includes(outcome.id);
        return <label key={outcome.id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/40"}`}>
          <Checkbox checked={selected} onCheckedChange={() => setOutcomes((current) => selected ? current.filter((id) => id !== outcome.id) : [...current, outcome.id])} className="mt-0.5" />
          <span><span className="block text-sm font-medium text-foreground">{outcome.title}</span><span className="text-sm text-muted-foreground">{outcome.description}</span></span>
        </label>;
      })}</div>
      <Card><CardHeader><CardTitle className="text-base">Your dashboard will show</CardTitle><CardDescription>Only standard metrics available to every supported practice are offered.</CardDescription></CardHeader><CardContent className="space-y-3">{metrics.map((id: MetricId) => <div key={id} className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-success" /><span>{metricLabels[id]}</span></div>)}<Button className="mt-3 w-full" disabled={mutation.isPending || !metrics.length} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : "Save dashboard"}</Button></CardContent></Card>
    </div>
  </AppShell>;
}