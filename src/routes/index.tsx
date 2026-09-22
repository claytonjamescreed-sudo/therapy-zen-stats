import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pepper — Practice Intelligence by HPC Billing" },
      { name: "description", content: "Practice intelligence, billing insights and onboarding dashboards from HPC Billing." },
      { property: "og:title", content: "Pepper — Practice Intelligence by HPC Billing" },
      { property: "og:description", content: "Practice intelligence, billing insights and onboarding dashboards from HPC Billing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
