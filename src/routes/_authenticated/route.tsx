import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAccess } from "@/lib/auth.functions";
import { AccessProvider } from "@/lib/access";
import { PracticeProvider } from "@/lib/practice-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const fetchAccess = useServerFn(getAccess);
  const { data, isPending } = useQuery({
    queryKey: ["access"],
    queryFn: () => fetchAccess({}),
  });

  if (isPending || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading your account…
      </div>
    );
  }

  return (
    <AccessProvider value={data}>
      <PracticeProvider allowedIds={data.isAdmin ? null : data.practiceId ? [data.practiceId] : []}>
        <Outlet />
      </PracticeProvider>
    </AccessProvider>
  );
}
