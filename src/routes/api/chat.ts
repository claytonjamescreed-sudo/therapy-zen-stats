import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { getAgent } from "@/lib/agents";
import { practices, agingTotal } from "@/data/practices";

type Body = {
  messages?: unknown;
  threadId?: string;
  agentKey?: string;
  practiceId?: string;
};

function practiceBriefing(practiceId: string | undefined) {
  const practice = practices.find((p) => p.id === practiceId);
  if (!practice) return "No practice data is available for this conversation.";
  const c = practice.current;
  const prev = practice.previous;
  const estimated = c.sessions * practice.defaultRate;
  return [
    `Practice: ${practice.name} (${practice.location}), ${practice.clinicians} clinicians.`,
    `EHR: ${practice.ehr}. Period: ${practice.monthLabel}.`,
    `Sessions: ${c.sessions} (last month ${prev.sessions}).`,
    `Estimated revenue: $${estimated.toLocaleString()} at an assumed median of $${practice.defaultRate} per session. The EHR reports session counts only, never charges billed, so revenue is always an estimate.`,
    `Revenue goal: $${practice.revenueGoal.toLocaleString()}.`,
    `New patients onboarded: ${c.newPatientsOnboarded} (last month ${prev.newPatientsOnboarded}). New patient appointments: ${c.newPatientAppointments}.`,
    `Patient cancellations: ${c.patientCancellations}. No-shows: ${c.noShows}. Late cancellations: ${c.lateCancellations}. Therapist cancellations: ${c.therapistCancellations}.`,
    `Patient balances outstanding: $${c.patientBalances.toLocaleString()}.`,
    `Insurance aging — 0-30: $${c.aging.d0_30.toLocaleString()}, 31-60: $${c.aging.d31_60.toLocaleString()}, 61-90: $${c.aging.d61_90.toLocaleString()}, 90+: $${c.aging.d90_plus.toLocaleString()}. Total $${agingTotal(c.aging).toLocaleString()} (last month $${prev.agingTotal.toLocaleString()}).`,
    `Onboarding: ${practice.onboarding
      .map((p) => `${p.name} ${p.items.filter((i) => i.done).length}/${p.items.length} done`)
      .join("; ")}.`,
  ].join("\n");
}

function citationsFor(practiceId: string | null, agentKey: string) {
  const practice = practices.find((p) => p.id === practiceId);
  if (!practice) return [];
  if (practice.lifecycle !== "live") {
    return [{ label: "Onboarding checklist", source: `${practice.asanaBoard.name} (demo)`, period: `Day ${practice.onboardingDay} of 30` }];
  }
  const datasets = agentKey === "ingrid"
    ? ["Appointments", "New-patient intake"]
    : agentKey === "billing"
      ? ["Patient balances", "Session ledger"]
      : agentKey === "insurance"
        ? ["Insurance claims aging", "Payer status"]
        : ["Appointments", "Insurance claims aging", "Patient balances"];
  return datasets.map((label) => ({ label, source: practice.ehr, period: practice.monthLabel }));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const authHeader = request.headers.get("Authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          },
        );
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: thread } = await supabaseAdmin
          .from("chat_threads")
          .select("id, user_id, agent_key, practice_id, title")
          .eq("id", body.threadId ?? "")
          .maybeSingle();
        if (!thread || thread.user_id !== user.id) {
          return new Response("Conversation not found", { status: 404 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const agent = getAgent((thread.agent_key as string) ?? body.agentKey ?? "pepper");
        const uiMessages = messages as UIMessage[];

        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabaseAdmin.from("chat_messages").insert({
            thread_id: thread.id as string,
            user_id: user.id,
            role: "user",
            parts: JSON.parse(JSON.stringify(lastUser.parts)),
          });
          if ((thread.title as string) === "New conversation") {
            const text = lastUser.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join(" ")
              .trim();
            if (text) {
              await supabaseAdmin
                .from("chat_threads")
                .update({ title: text.slice(0, 70) })
                .eq("id", thread.id as string);
            }
          }
        }

        const practice = practices.find((p) => p.id === (thread.practice_id as string | null));
        const system = [
          `You are ${agent.name}, the ${agent.title} on HPC Billing's Pepper practice-intelligence team. You advise the owners and managers of a mental-health practice.`,
          agent.focus,
          "Be direct and practical. Use the practice's own numbers whenever they are relevant, quote them plainly, and say what you would do next. Keep answers short — a few sentences or a tight list.",
          "Revenue figures are estimates based on session counts and a median rate per session. Say so whenever you quote revenue.",
          "If a question needs data the dashboard does not hold, say what is missing rather than inventing it.",
          "Do not add a sources section in prose; Pepper displays the available source records separately.",
          practice?.lifecycle !== "live" ? "This practice is pre-launch. Do not analyze the sample performance figures as live data. Help only with onboarding, metric selection, or what will become available after connection." : "The practice data below is live demo data for this product review.",
          "",
          "Current practice data:",
          practiceBriefing((thread.practice_id as string | null) ?? body.practiceId),
        ].join("\n");

        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system,
          messages: await convertToModelMessages(uiMessages),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              store: false,
            },
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ responseMessage }) => {
            const persistedParts = [
              ...responseMessage.parts,
              { type: "data-citations", data: { citations: citationsFor((thread.practice_id as string | null) ?? null, agent.key) } },
            ];
            await supabaseAdmin.from("chat_messages").insert({
              thread_id: thread.id as string,
              user_id: user.id,
              role: "assistant",
              parts: JSON.parse(JSON.stringify(persistedParts)),
            });
            await supabaseAdmin
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", thread.id as string);
          },
        });
      },
    },
  },
});
