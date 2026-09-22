import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAccess } from "@/lib/access";
import { practices } from "@/data/practices";
import { createClientAccount, deleteAccount, listAccounts } from "@/lib/auth.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Client Accounts — Pepper" },
      {
        name: "description",
        content:
          "Create logins for each practice and control which account's dashboard they can see.",
      },
      { property: "og:title", content: "Client Accounts — Pepper" },
      {
        property: "og:description",
        content: "Invite practices and manage who can see which dashboard.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const access = useAccess();
  const queryClient = useQueryClient();
  const fetchAccounts = useServerFn(listAccounts);
  const createAccount = useServerFn(createClientAccount);
  const removeAccount = useServerFn(deleteAccount);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [practiceId, setPracticeId] = useState(practices[0]!.id);

  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetchAccounts({}),
    enabled: access.isAdmin,
  });

  const create = useMutation({
    mutationFn: async () => {
      const practice = practices.find((p) => p.id === practiceId)!;
      return createAccount({
        data: {
          email: email.trim(),
          password,
          fullName: fullName.trim() || undefined,
          practiceId: practice.id,
          practiceName: practice.name,
        },
      });
    },
    onSuccess: () => {
      toast.success("Account created — share the email and password with your client");
      setEmail("");
      setFullName("");
      setPassword("");
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeAccount({ data: { userId } }),
    onSuccess: () => {
      toast.success("Account removed");
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!access.isAdmin) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Not available</CardTitle>
            <CardDescription>Only Pepper team members can manage accounts.</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Client accounts</h1>
        <p className="text-sm text-muted-foreground">
          Create a login for a practice. They will only ever see the account you assign them.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite a practice</CardTitle>
            <CardDescription>You set the first password and pass it on securely.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="practice">Practice</Label>
                <Select value={practiceId} onValueChange={setPracticeId}>
                  <SelectTrigger id="practice">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Contact name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Temporary password</Label>
                <Input
                  id="new-password"
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Who has access</CardTitle>
            <CardDescription>Everyone with a login and the account they can see.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.isPending ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (accounts.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
            ) : (
              (accounts.data ?? []).map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.fullName || a.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                  </div>
                  <Badge variant={a.isAdmin ? "default" : "outline"} className="ml-auto">
                    {a.isAdmin ? "Pepper team — all practices" : (a.practiceName ?? "Unassigned")}
                  </Badge>
                  {a.id === access.userId ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove.mutate(a.id)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
