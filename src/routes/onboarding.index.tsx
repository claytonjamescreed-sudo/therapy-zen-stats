import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Bell, CircleCheck, Clock, RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { phaseStatus, usePractice } from "@/lib/practice-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/")({
  head: () => ({
    meta: [
      { title: "Onboarding Tracker — Pepper" },
      {
        name: "description",
        content:
          "Red, amber, green onboarding checklist showing every practice exactly where they stand and what is next.",
      },
      { property: "og:title", content: "Onboarding Tracker — Pepper" },
      {
        property: "og:description",
        content: "A provider-facing onboarding checklist with clear progress at every phase.",
      },
    ],
  }),
  component: OnboardingPage,
});

const statusStyles = {
  green: "bg-success/15 text-success border-success/30",
  amber: "bg-warning/20 text-warning-foreground border-warning/40",
  red: "bg-destructive/10 text-destructive border-destructive/30",
} as const;

const statusLabel = { green: "Complete", amber: "In progress", red: "Needs attention" } as const;

function OnboardingPage() {
  const { practice, phases, toggleItem } = usePractice();

  const allItems = phases.flatMap((p) => p.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const overall = allItems.length ? (doneCount / allItems.length) * 100 : 0;
  const nextItem = allItems.find((i) => !i.done);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Onboarding</h1>
          <p className="text-sm text-muted-foreground">
            Where {practice.name} stands on getting fully set up with Pepper.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/onboarding/archive">
            <Archive className="size-4" />
            Completed items
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-medium text-foreground">Overall progress</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {doneCount} of {allItems.length} complete
              </span>
            </div>
            <Progress value={overall} />
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {nextItem ? (
                <>
                  Next up: <span className="font-medium text-foreground">{nextItem.label}</span> —{" "}
                  {nextItem.owner}, due {nextItem.due}
                </>
              ) : (
                "Everything is complete. Nice work."
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground md:w-64">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <RefreshCcw className="size-3.5" /> {practice.asanaBoard.name}
            </span>
            <span>
              Asana board · last read {practice.asanaBoard.syncedMinutesAgo} min ago (demo data)
            </span>
            <span>Write-back to Asana — coming soon</span>
            <span className="flex items-center gap-2">
              <Bell className="size-3.5" /> Email reminders — coming soon
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {phases.map((phase) => {
          const s = phaseStatus(phase);
          return (
            <Card key={phase.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{phase.name}</CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", statusStyles[s.status])}>
                    {statusLabel[s.status]}
                  </Badge>
                </div>
                <Progress value={s.ratio * 100} className="mt-3" />
              </CardHeader>
              <CardContent className="space-y-1">
                {phase.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary/60"
                  >
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={() => toggleItem(phase.id, item.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm",
                          item.done ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.owner} · due {item.due}
                        {item.done && item.completedOn ? ` · done ${item.completedOn}` : ""}
                      </span>
                    </span>
                    {item.done && <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />}
                  </label>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
