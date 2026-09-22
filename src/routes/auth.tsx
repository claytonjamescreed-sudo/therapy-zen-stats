import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimOwner, ensureDemoAccount, ownerExists } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Pepper" },
      {
        name: "description",
        content:
          "Sign in to Pepper to see your practice's billing, revenue and onboarding dashboards.",
      },
      { property: "og:title", content: "Sign in — Pepper" },
      { property: "og:description", content: "Secure sign in for Pepper practice dashboards." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const checkOwner = useServerFn(ownerExists);
  const claim = useServerFn(claimOwner);
  const ensureDemo = useServerFn(ensureDemoAccount);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const owner = useQuery({ queryKey: ["owner-exists"], queryFn: () => checkOwner({}) });
  const setupMode = owner.data?.exists === false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (setupMode) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        await claim({});
        toast.success("Owner account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function devLogin(kind: "owner" | "client") {
    setBusy(true);
    try {
      const creds = await ensureDemo({ data: { kind } });
      const { error } = await supabase.auth.signInWithPassword(creds);
      if (error) throw error;
      toast.success(kind === "owner" ? "Signed in as demo owner" : "Signed in as demo client");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dev sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Pepper</p>
            <p className="text-xs text-muted-foreground">Practice intelligence</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {setupMode ? "Create the owner account" : "Sign in"}
            </CardTitle>
            <CardDescription>
              {setupMode
                ? "This is the first account, so it becomes the owner with access to every practice."
                : "Accounts are created by Pepper. Use the email and password you were given."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={setupMode ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Please wait…" : setupMode ? "Create owner account" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
