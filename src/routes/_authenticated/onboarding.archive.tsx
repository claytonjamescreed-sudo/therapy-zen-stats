import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePractice } from "@/lib/practice-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/onboarding/archive")({
  head: () => ({
    meta: [
      { title: "Completed Items — Pepper | HPC Billing" },
      {
        name: "description",
        content:
          "Archive of signed contracts, agreements and completed onboarding steps, available any time after go-live.",
      },
      { property: "og:title", content: "Completed Items — Pepper | HPC Billing" },
      {
        property: "og:description",
        content: "Signed contracts and completed onboarding steps, kept accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const { practice, phases } = usePractice();

  const documents = phases.flatMap((phase) =>
    phase.items
      .filter((item) => item.done && item.archiveLabel)
      .map((item) => ({ ...item, phase: phase.name })),
  );
  const completedSteps = phases.flatMap((phase) =>
    phase.items
      .filter((item) => item.done && !item.archiveLabel)
      .map((item) => ({ ...item, phase: phase.name })),
  );

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/onboarding">
          <ArrowLeft className="size-4" />
          Back to onboarding
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold text-foreground">Completed items</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Everything {practice.name} has finished, kept accessible after go-live.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
            <CardDescription>Contracts and paperwork on file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing filed yet.</p>
            )}
            {documents.map((doc) => (
              <div
                key={`${doc.phase}-${doc.id}`}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <FileText className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {doc.archiveLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doc.phase} · {doc.completedOn}
                  </span>
                </span>
                <Badge variant="secondary">Filed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed steps</CardTitle>
            <CardDescription>Tasks finished without an attached document.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedSteps.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing completed yet.</p>
            )}
            {completedSteps.map((item) => (
              <div
                key={`${item.phase}-${item.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.phase} · {item.owner}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.completedOn}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
