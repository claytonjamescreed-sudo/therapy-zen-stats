import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAccess } from "@/lib/access";
import { usePractice } from "@/lib/practice-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/onboarding-queue")({
  head: () => ({ meta: [
    { title: "Onboarding Queue — Pepper | HPC Billing" },
    { name: "description", content: "Owner queue for practice onboarding progress, blockers, ownership, and account activity." },
    { property: "og:title", content: "Onboarding Queue — Pepper | HPC Billing" },
    { property: "og:description", content: "See every onboarding practice and its next required step." },
  ] }),
  component: OnboardingQueuePage,
});

function OnboardingQueuePage() {
  const access = useAccess();
  const { practices, phasesFor, setPracticeId } = usePractice();
  const navigate = useNavigate();
  if (!access.isAdmin) return <AppShell><Card><CardHeader><CardTitle>Not available</CardTitle><CardDescription>Only HPC Billing owners can view the onboarding queue.</CardDescription></CardHeader></Card></AppShell>;
  const onboarding = practices.filter((p) => p.lifecycle === "onboarding");
  return <AppShell>
    <div className="mb-6"><h1 className="text-2xl font-semibold text-foreground">Onboarding queue</h1><p className="text-sm text-muted-foreground">One list for practices between signed and live.</p></div>
    <div className="space-y-4">{onboarding.map((practice) => {
      const phases = phasesFor(practice.id);
      const all = phases.flatMap((phase) => phase.items.map((item) => ({ ...item, phase: phase.name })));
      const done = all.filter((item) => item.done).length;
      const percent = all.length ? Math.round((done / all.length) * 100) : 0;
      const next = all.find((item) => !item.done);
      return <Card key={practice.id}>
        <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
          <div><div className="flex items-center gap-2"><CardTitle className="text-base">{practice.name}</CardTitle><Badge variant="outline">Day {practice.onboardingDay} of 30</Badge></div><CardDescription>{practice.ehr} · Last login {practice.lastLogin} (demo)</CardDescription></div>
          <Button size="sm" onClick={() => { setPracticeId(practice.id); navigate({ to: "/onboarding" }); }}>Open checklist<ArrowRight className="size-4" /></Button>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[1fr_1.4fr_auto] md:items-center">
          <div><div className="mb-2 flex justify-between text-sm"><span>Progress</span><span className="tabular-nums text-muted-foreground">{done} of {all.length}</span></div><Progress value={percent} /></div>
          <div className="flex items-start gap-2"><AlertCircle className="mt-0.5 size-4 text-warning" /><div><p className="text-sm font-medium text-foreground">{next?.label ?? "Ready to go live"}</p><p className="text-xs text-muted-foreground">{next ? `${next.phase} · ${next.owner} · due ${next.due}` : "All onboarding work is complete"}</p></div></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCcw className="size-3.5" />Asana read {practice.asanaBoard.syncedMinutesAgo} min ago</div>
        </CardContent>
      </Card>;
    })}</div>
  </AppShell>;
}