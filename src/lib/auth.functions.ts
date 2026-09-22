import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Access = {
  userId: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  practiceId: string | null;
  practiceName: string | null;
};

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Admin access required");
  return supabaseAdmin;
}

export const getAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Access> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId),
    ]);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    return {
      userId: context.userId,
      email: (profile?.email as string) ?? (context.claims?.["email"] as string) ?? "",
      fullName: (profile?.full_name as string | null) ?? null,
      isAdmin,
      practiceId: isAdmin ? null : ((profile?.practice_id as string | null) ?? null),
      practiceName: (profile?.practice_name as string | null) ?? null,
    };
  });

/** Public: true once at least one admin/owner account exists. */
export const ownerExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return { exists: (count ?? 0) > 0 };
});

/** First signed-up account claims owner/admin. No-op once an admin exists. */
export const claimOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { claimed: false };

    await supabaseAdmin.from("profiles").upsert({
      id: context.userId,
      email: (context.claims?.["email"] as string) ?? "",
      practice_id: null,
      practice_name: null,
    });
    await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    return { claimed: true };
  });

export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: true }),
      admin.from("user_roles").select("user_id, role"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    return (profiles ?? []).map((p) => ({
      id: p.id as string,
      email: p.email as string,
      fullName: (p.full_name as string | null) ?? null,
      practiceId: (p.practice_id as string | null) ?? null,
      practiceName: (p.practice_name as string | null) ?? null,
      isAdmin: adminIds.has(p.id as string),
    }));
  });

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().trim().optional(),
  practiceId: z.string().min(1),
  practiceName: z.string().min(1),
});

export const createClientAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account");

    const { error: profileError } = await admin.from("profiles").upsert({
      id: created.user.id,
      email: data.email,
      full_name: data.fullName ?? null,
      practice_id: data.practiceId,
      practice_name: data.practiceName,
    });
    if (profileError) throw new Error(profileError.message);
    await admin.from("user_roles").insert({ user_id: created.user.id, role: "client" });
    return { id: created.user.id };
  });

/**
 * Testing shortcut: makes sure a demo owner / demo client account exists and
 * returns its credentials so the sign-in page can log straight in.
 * Remove this before the app is used with real practice data.
 */
export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ kind: z.enum(["owner", "client"]) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isOwner = data.kind === "owner";
    const email = isOwner ? "dev-owner@pepper.test" : "dev-client@pepper.test";
    const password = "PepperDemo!2026";

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = (list?.users ?? []).find((u) => u.email === email) ?? null;

    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error || !created.user) throw new Error(error?.message ?? "Could not create demo account");
      user = created.user;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    }

    await supabaseAdmin.from("profiles").upsert({
      id: user.id,
      email,
      full_name: isOwner ? "Pepper Demo Owner" : "Willow Creek Demo",
      practice_id: isOwner ? null : "willow-creek",
      practice_name: isOwner ? null : "Willow Creek Counseling",
    });

    const role = isOwner ? "admin" : "client";
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", role)
      .maybeSingle();
    if (!existingRole) {
      await supabaseAdmin.from("user_roles").insert({ user_id: user.id, role });
    }

    return { email, password };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("You cannot remove your own account");
    await admin.from("user_roles").delete().eq("user_id", data.userId);
    await admin.from("profiles").delete().eq("id", data.userId);
    await admin.auth.admin.deleteUser(data.userId);
    return { ok: true };
  });
