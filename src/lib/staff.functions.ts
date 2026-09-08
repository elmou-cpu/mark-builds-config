import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe, safeError } from "./errors";

export interface StaffMember {
  userId: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
  isSelf: boolean;
}

/** Lists administrators. Admin-only; email addresses come from the auth system. */
export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffMember[]> => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);

    const { data: roles, error } = await context.supabase
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin");
    if (error) rethrowSafe(error, "Impossible de charger les administrateurs.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const byId = new Map((users?.users ?? []).map((user) => [user.id, user]));

    return (roles ?? []).map((row) => {
      const user = byId.get(row.user_id);
      return {
        userId: row.user_id,
        email: user?.email ?? "(compte supprimé)",
        createdAt: row.created_at,
        lastSignInAt: user?.last_sign_in_at ?? null,
        confirmed: Boolean(user?.email_confirmed_at),
        isSelf: row.user_id === context.userId,
      };
    });
  });

/**
 * Invites a new administrator by email. The invitee sets their own password
 * through the emailed link; no password is ever chosen or stored here.
 */
export const inviteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().email().max(200), redirectTo: z.string().max(300) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);
    const email = data.email.trim().toLowerCase();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let userId = existing?.users.find((user) => user.email?.toLowerCase() === email)?.id ?? null;
    let invited = false;

    if (!userId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: data.redirectTo,
      });
      if (error || !created.user) {
        console.error("[staff] invite failed", error);
        throw safeError("L'invitation n'a pas pu être envoyée à cette adresse.");
      }
      userId = created.user.id;
      invited = true;
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin", granted_by: context.userId }, {
        onConflict: "user_id,role",
      });
    if (roleError) rethrowSafe(roleError, "Le rôle n'a pas pu être attribué.");

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin.from("admin_invitations").insert({
      email,
      invited_by: context.userId,
      invited_user_id: userId,
      expires_at: expires,
      ...(invited ? {} : { accepted_at: new Date().toISOString() }),
    });

    await logAudit(context, {
      action: "admin.invite",
      entityType: "admin",
      entityId: userId,
      entityLabel: email,
      after: { email, invited },
    });

    return { ok: true, invited };
  });

/** Removes the admin role. Cannot remove yourself or the last administrator. */
export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);

    if (data.userId === context.userId) throw safeError("Vous ne pouvez pas retirer votre propre accès.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) rethrowSafe(countError, "Impossible de vérifier les administrateurs.");
    if ((count ?? 0) <= 1) throw safeError("Impossible de retirer le dernier administrateur.");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) rethrowSafe(error, "L'accès n'a pas pu être retiré.");

    await logAudit(context, {
      action: "admin.revoke",
      entityType: "admin",
      entityId: data.userId,
      before: { role: "admin" },
    });
    return { ok: true };
  });
