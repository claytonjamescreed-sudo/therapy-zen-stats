import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SyncBanner } from "@/components/AppShell";
import { usePractice } from "@/lib/practice-store";
import { currency } from "@/data/practices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Revenue Goals — Pepper | HPC Billing" },
      {
        name: "description",
        content:
          "Set a monthly revenue target and see the sessions, new patients and no-show rate required to hit it.",
      },
      { property: "og:title", content: "Revenue Goals — Pepper | HPC Billing" },
      {
        property: "og:description",
        content: "Walk a revenue target back into the KPIs a practice needs to hit it.",
      },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { practice, rate, goal, setGoal } = usePractice();
  const c = practice.current;

  if (practice.lifecycle !== "live") {
    return <AppShell><SyncBanner /><Card className="mx-auto max-w-2xl"><CardHeader><CardTitle>Goals unlock after your first data pull</CardTitle><CardDescription>HPC Billing needs verified sessions and attendance data before Pepper can walk a revenue target back to reliable operating numbers.</CardDescription></CardHeader><CardContent className="flex gap-2"><Button asChild><Link to="/onboarding">Continue onboarding</Link></Button><Button asChild variant="outline"><Link to="/metrics">Choose future metrics</Link></Button></CardContent></Card></AppShell>;
  }

  const estRevenue = c.sessions * rate;
  const sessionsNeeded = Math.ceil(goal / rate);
  const sessionGap = Math.max(sessionsNeeded - c.sessions, 0);
  const sessionsPerNewPatient = 6;
  const newPatientsNeeded = Math.ceil(sessionGap / sessionsPerNewPatient);
  const scheduled = c.sessions + c.noShows + c.lateCancellations + c.patientCancellations;
  const currentNoShowRate = (c.noShows / scheduled) * 100;
  const allowableNoShowRate = Math.max(
    ((scheduled - sessionsNeeded) / scheduled) * 100,
    0,
  );
  const progress = Math.min((estRevenue / goal) * 100, 100);

  const rows = [
    {
      label: "Sessions this month",
      current: c.sessions.toLocaleString(),
      target: sessionsNeeded.toLocaleString(),
      pct: Math.min((c.sessions / sessionsNeeded) * 100, 100),
      note: sessionGap === 0 ? "Target met" : `${sessionGap} more sessions needed`,
    },
    {
      label: "New patients",
      current: String(c.newPatientsOnboarded),
      target: String(c.newPatientsOnboarded + newPatientsNeeded),
      pct:
        newPatientsNeeded === 0
          ? 100
          : (c.newPatientsOnboarded / (c.newPatientsOnboarded + newPatientsNeeded)) * 100,
      note:
        newPatientsNeeded === 0
          ? "No additional intakes required"
          : `${newPatientsNeeded} more intakes at ~${sessionsPerNewPatient} sessions each`,
    },
    {
      label: "No-show rate",
      current: `${currentNoShowRate.toFixed(1)}%`,
      target: `${allowableNoShowRate.toFixed(1)}%`,
      pct: Math.min((allowableNoShowRate / Math.max(currentNoShowRate, 0.1)) * 100, 100),
      note:
        currentNoShowRate <= allowableNoShowRate
          ? "Within allowance"
          : "Reducing no-shows closes part of the gap",
    },
  ];

  return (
    <AppShell>
      <SyncBanner />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Revenue goal</h1>
          <p className="text-sm text-muted-foreground">
            Set a target and the dashboard walks it back to the numbers behind it.
          </p>
        </div>
        <Badge variant="outline">Preview feature</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly target</CardTitle>
            <CardDescription>At {currency(rate)} median per session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Revenue target</Label>
              <Input
                id="goal"
                type="number"
                step={5000}
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Tracking</span>
                <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <p className="mt-2 text-sm text-muted-foreground">
                {currency(estRevenue)} of {currency(goal)} estimated so far.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">What it takes</CardTitle>
            <CardDescription>The KPIs behind the target for {practice.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {row.current} → {row.target}
                  </span>
                </div>
                <Progress value={row.pct} />
                <p className="mt-1 text-xs text-muted-foreground">{row.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
