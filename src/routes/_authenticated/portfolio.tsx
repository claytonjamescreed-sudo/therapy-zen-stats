import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Building2, CircleCheck, Clock3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { useAccess } from "@/lib/access";
import { phaseStatus, usePractice } from "@/lib/practice-store";
import { agingTotal, currency, type Practice } from "@/data/practices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({
    meta: [
      { title: "Practice Portfolio — Pepper | HPC Billing" },
      { name: "description", content: "Owner view of practice health, onboarding, aging, attendance, and account activity." },
      { property: "og:title", content: "Practice Portfolio — Pepper | HPC Billing" },
      { property: "og:description", content: "A single owner view across every client practice." },
    ],
  }),
  component: PortfolioPage,
});

type Filter = "all" | "live" | "onboarding" | "attention";

function lostRate(practice: Practice) {
  const lost = practice.current.patientCancellations + practice.current.noShows + practice.current.lateCancellations;
  return (lost / Math.max(1, practice.current.sessions + lost)) * 100;
}

function PortfolioPage() {
  const access = useAccess();
  const { practices, phasesFor, setPracticeId } = usePractice();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(() => practices.filter((practice) => {
    if (filter === "live") return practice.lifecycle === "live";
    if (filter === "onboarding") return practice.lifecycle === "onboarding";
    if (filter === "attention") return practice.attention !== "healthy";
    return true;
  }), [filter, practices]);

  if (!access.isAdmin) return <AppShell><Card><CardHeader><CardTitle>Not available</CardTitle><CardDescription>Only HPC Billing owners can view the complete portfolio.</CardDescription></CardHeader></Card></AppShell>;

  const total90 = practices.filter((p) => p.lifecycle === "live").reduce((sum, p) => sum + p.current.aging.d90_plus, 0);
  const onboarding = practices.filter((p) => p.lifecycle === "onboarding").length;
  const attention = practices.filter((p) => p.attention !== "healthy").length;

  function openPractice(id: string, destination: "/dashboard" | "/onboarding") {
    setPracticeId(id);
    navigate({ to: destination });
  }

  return <AppShell>
    <div className="mb-6"><h1 className="text-2xl font-semibold text-foreground">Practice portfolio</h1><p className="text-sm text-muted-foreground">Every client practice, with the issues that need attention first.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Practices" value={String(practices.length)} sublabel="in your portfolio" />
      <MetricCard label="Live" value={String(practices.length - onboarding)} sublabel="reporting current data" />
      <MetricCard label="In onboarding" value={String(onboarding)} sublabel="not live yet" />
      <MetricCard label="Combined A/R 90+" value={currency(total90)} sublabel={`${attention} need attention`} />
    </div>
    <Card className="mt-6">
      <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
        <div><CardTitle className="text-base">All practices</CardTitle><CardDescription>Login activity and EHR stages are illustrative until live connections are added.</CardDescription></div>
        <div className="flex flex-wrap gap-2">{(["all", "live", "onboarding", "attention"] as Filter[]).map((value) => <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>{value === "attention" ? "Needs attention" : value[0]?.toUpperCase() + value.slice(1)}</Button>)}</div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-border px-2 pb-2 text-xs font-medium text-muted-foreground"><span>Practice</span><span>EHR</span><span>Stage</span><span>A/R 90+</span><span>Lost visits</span><span>Last login</span><span /></div>
          {visible.map((practice) => {
            const phases = phasesFor(practice.id);
            const items = phases.flatMap((p) => p.items);
            const complete = items.length ? Math.round((items.filter((i) => i.done).length / items.length) * 100) : 0;
            return <div key={practice.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-border px-2 py-4 text-sm last:border-0">
              <span className="flex items-center gap-2 font-medium text-foreground">{practice.attention === "urgent" ? <AlertTriangle className="size-4 text-destructive" /> : practice.attention === "watch" ? <Clock3 className="size-4 text-warning" /> : <CircleCheck className="size-4 text-success" />}{practice.name}</span>
              <span className="text-muted-foreground">{practice.ehr}</span>
              <span><Badge variant="outline">{practice.lifecycle === "live" ? "Live" : `${complete}% onboarded`}</Badge></span>
              <span className="tabular-nums">{practice.lifecycle === "live" ? currency(agingTotal(practice.current.aging) ? practice.current.aging.d90_plus : 0) : "—"}</span>
              <span className="tabular-nums">{practice.lifecycle === "live" ? `${lostRate(practice).toFixed(1)}%` : "—"}</span>
              <span className="text-muted-foreground">{practice.lastLogin}</span>
              <Button size="sm" variant="outline" onClick={() => openPractice(practice.id, practice.lifecycle === "live" ? "/dashboard" : "/onboarding")}><Building2 className="size-4" />Open</Button>
            </div>;
          })}
        </div>
      </CardContent>
    </Card>
  </AppShell>;
}