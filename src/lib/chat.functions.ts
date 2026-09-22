import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StoredCitation = { label: string; source: string; period: string };
export type StoredPart = { type: string; text?: string; data?: { citations?: StoredCitation[] } };

export type ThreadSummary = {
  id: string;
  agentKey: string;
  title: string;
  practiceName: string | null;
  updatedAt: string;
};

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ThreadSummary[]> => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .select("id, agent_key, title, practice_name, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((t) => ({
      id: t.id as string,
      agentKey: t.agent_key as string,
      title: t.title as string,
      practiceName: (t.practice_name as string | null) ?? null,
      updatedAt: t.updated_at as string,
    }));
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        agentKey: z.string().min(1),
        practiceId: z.string().min(1),
        practiceName: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("chat_threads")
      .insert({
        user_id: context.userId,
        agent_key: data.agentKey,
        practice_id: data.practiceId,
        practice_name: data.practiceName,
        title: "New conversation",
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Could not start the conversation");
    return { id: row.id as string };
  });

export const getThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ threadId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: thread, error } = await context.supabase
      .from("chat_threads")
      .select("id, agent_key, title, practice_id, practice_name")
      .eq("id", data.threadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!thread) throw new Error("Conversation not found");

    const { data: rows, error: msgError } = await context.supabase
      .from("chat_messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (msgError) throw new Error(msgError.message);

    return {
      id: thread.id as string,
      agentKey: thread.agent_key as string,
      title: thread.title as string,
      practiceId: (thread.practice_id as string | null) ?? null,
      practiceName: (thread.practice_name as string | null) ?? null,
      messages: (rows ?? []).map((m) => ({
        id: m.id as string,
        role: m.role as "user" | "assistant",
        parts: (m.parts ?? []) as StoredPart[],
      })),
    };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ threadId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("chat_threads")
      .delete()
      .eq("id", data.threadId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
