import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Compass, UserPlus, Receipt, ShieldCheck, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { usePractice } from "@/lib/practice-store";
import { agents, getAgent, type Agent } from "@/lib/agents";
import { createThread, deleteThread, listThreads } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/agents")({
  head: () => ({
    meta: [
      { title: "Ask an agent — Pepper" },
      {
        name: "description",
        content:
          "Ask Pepper's intake, billing and insurance agents about your practice's numbers and get practical next steps.",
      },
      { property: "og:title", content: "Ask an agent — Pepper" },
      {
        property: "og:description",
        content: "Chat with Pepper's practice agents about intake, billing and insurance.",
      },
    ],
  }),
  component: AgentsPage,
});

const icons = { Compass, UserPlus, Receipt, ShieldCheck };

function AgentsPage() {
  const { practice } = usePractice();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchThreads = useServerFn(listThreads);
  const start = useServerFn(createThread);
  const remove = useServerFn(deleteThread);
  const [busy, setBusy] = useState(false);

  const threads = useQuery({ queryKey: ["chat-threads"], queryFn: () => fetchThreads({}) });

  async function startChat(agent: Agent) {
    setBusy(true);
    try {
      const { id } = await start({
        data: { agentKey: agent.key, practiceId: practice.id, practiceName: practice.name },
      });
      await queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      navigate({ to: "/agents/$threadId", params: { threadId: id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the conversation");
    } finally {
      setBusy(false);
    }
  }

  async function removeThread(threadId: string) {
    try {
      await remove({ data: { threadId } });
      await queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the conversation");
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Ask an agent</h1>
        <p className="text-sm text-muted-foreground">
          Pepper's specialists answer using {practice.name}'s current numbers. Conversations are
          saved to your account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => {
          const Icon = icons[agent.icon];
          return (
            <Card key={agent.key} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <CardTitle className="text-base">
                      {agent.name}{" "}
                      <span className="font-normal text-muted-foreground">· {agent.title}</span>
                    </CardTitle>
                    <CardDescription>{agent.blurb}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {agent.starters.slice(0, 2).map((s) => (
                    <li key={s}>"{s}"</li>
                  ))}
                </ul>
                <Button size="sm" disabled={busy} onClick={() => startChat(agent)}>
                  <MessageSquare className="size-4" />
                  Ask {agent.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Your conversations</CardTitle>
          <CardDescription>Saved to your account, so they follow you between devices.</CardDescription>
        </CardHeader>
        <CardContent>
          {threads.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (threads.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No conversations yet. Pick an agent above to start one.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {(threads.data ?? []).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => navigate({ to: "/agents/$threadId", params: { threadId: t.id } })}
                  >
                    <span className="block text-sm font-medium text-foreground">{t.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {getAgent(t.agentKey).name} · {t.practiceName ?? "—"}
                    </span>
                  </button>
                  <Badge variant="outline">{getAgent(t.agentKey).title}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete conversation"
                    onClick={() => removeThread(t.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
