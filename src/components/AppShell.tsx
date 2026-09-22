import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, LogOut, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { usePractice } from "@/lib/practice-store";
import { useAccess } from "@/lib/access";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/goals", label: "Goals" },
  { to: "/onboarding", label: "Onboarding" },
  { to: "/agents", label: "Ask an agent" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { practice, practices, setPracticeId } = usePractice();
  const access = useAccess();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Pepper</p>
              <p className="text-xs text-muted-foreground">Practice intelligence</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ))}
            {access.isAdmin ? (
              <Link
                to="/admin"
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                Client accounts
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {access.isAdmin ? (
              <>
                <Badge variant="outline">Owner view</Badge>
                <Select value={practice.id} onValueChange={setPracticeId}>
                  <SelectTrigger className="w-[230px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {practices.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <span className="text-sm font-medium text-foreground">{practice.name}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`${practice.ehr} data refreshed`)}
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} title={access.email}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-xs text-muted-foreground">
        Signed in as {access.email}. Demo data for review — live EHR connections are not wired up in
        this version.
      </footer>
    </div>
  );
}

export function SyncBanner() {
  const { practice } = usePractice();
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-medium text-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        {practice.ehr}
      </span>
      <span className="text-muted-foreground">
        Synced {practice.syncedMinutesAgo} minutes ago · {practice.clinicians} clinicians ·{" "}
        {practice.location}
      </span>
      <span className="ml-auto text-muted-foreground">{practice.monthLabel}</span>
    </div>
  );
}
