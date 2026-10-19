import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe } from "./errors";

export const listAuditEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("audit_log")
      .select("id, actor_email, action, entity_type, entity_label, created_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) rethrowSafe(error, "Impossible de charger l'activité.");
    return data ?? [];
  });