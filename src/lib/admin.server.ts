import { getRequestHeader } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { safeError } from "./errors";

export type UserClient = SupabaseClient<Database>;

export interface AuthedContext {
  supabase: UserClient;
  userId: string;
  claims?: Record<string, unknown>;
}

/**
 * Re-checks the admin role in the database on every privileged call, so a
 * revoked administrator's existing session stops working immediately.
 */
export async function assertAdmin(context: AuthedContext): Promise<void> {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) {
    console.error("[auth] role check failed", error);
    throw safeError("Impossible de vérifier vos droits.");
  }
  if (data !== true) throw safeError("Accès refusé.");
}

export function actorEmail(context: AuthedContext): string {
  const claims = context.claims as { email?: string } | undefined;
  return claims?.email ?? "";
}

/** Writes an audit entry. Never blocks the operation it records. */
export async function logAudit(
  context: AuthedContext,
  entry: {
    action: string;
    entityType: string;
    entityId?: string | null;
    entityLabel?: string;
    before?: unknown;
    after?: unknown;
  },
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: actorEmail(context),
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      entity_label: entry.entityLabel ?? "",
      before_data: (entry.before ?? null) as never,
      after_data: (entry.after ?? null) as never,
    });
  } catch (error) {
    console.error("[audit] failed to record", entry.action, error);
  }
}

/** Client IP as reported by the edge, used for rate-limit buckets only. */
export function clientIp(): string {
  try {
    const forwarded = getRequestHeader("x-forwarded-for") ?? "";
    return forwarded.split(",")[0]?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

/** Server-side throttle backed by the rate_limits table. */
export async function throttle(
  bucket: string,
  limit: number,
  windowSeconds: number,
  backoffSeconds = 60,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
    p_bucket: bucket.slice(0, 200),
    p_limit: limit,
    p_window_seconds: windowSeconds,
    p_backoff_seconds: backoffSeconds,
  });
  if (error) {
    console.error("[rate-limit] check failed", error);
    return; // fail open rather than blocking legitimate traffic on an infra error
  }
  const result = data as { allowed?: boolean; retry_after?: number } | null;
  if (result && result.allowed === false) {
    const wait = Math.max(1, Number(result.retry_after ?? 60));
    throw safeError(`Trop de tentatives. Réessayez dans ${wait} seconde(s).`);
  }
}

export async function resetThrottle(bucket: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("reset_rate_limit", { p_bucket: bucket.slice(0, 200) });
  } catch {
    /* non-fatal */
  }
}
