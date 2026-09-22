import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Compass, UserPlus, Receipt, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { getAgent } from "@/lib/agents";
import { getThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/sources";
import type { StoredCitation } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/agents/$threadId")({
  head: () => ({
    meta: [
      { title: "Agent conversation — Pepper | HPC Billing" },
      {
        name: "description",
        content: "A saved conversation with one of HPC Billing's Pepper specialists.",
      },
      { property: "og:title", content: "Agent conversation — Pepper | HPC Billing" },
      {
        property: "og:description",
        content: "Continue your conversation with an HPC Billing Pepper specialist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThreadPage,
});

const icons = { Compass, UserPlus, Receipt, ShieldCheck };

function ThreadPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const load = useServerFn(getThread);

  const thread = useQuery({
    queryKey: ["chat-thread", threadId],
    queryFn: () => load({ data: { threadId } }),
    retry: false,
  });

  if (thread.isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading conversation…</p>
      </AppShell>
    );
  }

  if (thread.isError || !thread.data) {
    return (
      <AppShell>
        <p className="mb-4 text-sm text-muted-foreground">This conversation is not available.</p>
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/agents" })}>
          Back to agents
        </Button>
      </AppShell>
    );
  }

  const initial: UIMessage[] = thread.data.messages.map((m) => ({
    id: m.id,
    role: m.role,
    parts: m.parts as UIMessage["parts"],
  }));

  return (
    <AppShell>
      <ChatWindow
        key={threadId}
        threadId={threadId}
        agentKey={thread.data.agentKey}
        practiceName={thread.data.practiceName}
        initialMessages={initial}
      />
    </AppShell>
  );
}

function ChatWindow({
  threadId,
  agentKey,
  practiceName,
  initialMessages,
}: {
  threadId: string;
  agentKey: string;
  practiceName: string | null;
  initialMessages: UIMessage[];
}) {
  const agent = getAgent(agentKey);
  const Icon = icons[agent.icon];
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages }) => {
          const { data } = await supabase.auth.getSession();
          return {
            headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
            body: { messages, threadId, agentKey },
          };
        },
      }),
    [threadId, agentKey],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (error) => toast.error(error.message || "The agent could not reply"),
  });

  const isBusy = status === "submitted" || status === "streaming";

  function citationsForMessage(message: UIMessage): StoredCitation[] {
    const part = message.parts.find((candidate) => candidate.type === "data-citations") as { data?: { citations?: StoredCitation[] } } | undefined;
    if (part?.data?.citations?.length) return part.data.citations;
    if (message.role !== "assistant") return [];
    return [{ label: "Practice dashboard", source: practiceName ?? "Selected practice", period: "Current reporting period" }];
  }

  useEffect(() => {
    if (!isBusy) textareaRef.current?.focus();
  }, [isBusy, threadId]);

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isBusy) return;
    setInput("");
    await sendMessage({ text: value });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/agents"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Back to agents"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground">
          <Icon className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">
            {agent.name} · {agent.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Answering with {practiceName ?? "your practice"}'s current numbers
          </p>
        </div>
      </div>

      <Conversation className="flex-1 rounded-lg border border-border bg-card">
        <ConversationContent>
          {messages.length === 0 ? (
            <div className="space-y-3 py-6">
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {agent.starters.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => submit(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => {
            const citations = citationsForMessage(message);
            return (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <MessageResponse key={i}>{part.text}</MessageResponse>
                  ) : null,
                )}
                {citations.length ? <Sources><SourcesTrigger count={citations.length} /><SourcesContent>{citations.map((citation) => <div key={`${citation.label}-${citation.source}`} className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"><span className="font-medium">{citation.label}</span><span className="text-muted-foreground">{citation.source} · {citation.period}</span></div>)}</SourcesContent></Sources> : null}
              </MessageContent>
            </Message>
            );
          })}

          {status === "submitted" ? <Shimmer>Thinking…</Shimmer> : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        className="mt-4"
        onSubmit={(message, event) => {
          event.preventDefault();
          void submit(message.text || input);
        }}
      >
        <PromptInputTextarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${agent.name} about ${practiceName ?? "your practice"}…`}
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
