import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe } from "./errors";

export const MESSAGE_STATUSES = ["nouveau", "lu", "resolu"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

const contactSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(30).default(""),
  subject: z.string().max(150).default(""),
  message: z.string().min(10).max(4000),
});

/** Public contact form. Validated and rate-limited server-side, then stored. */
export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, throttle } = await import("./admin.server");
    const ip = clientIp();
    await throttle(`contact:ip:${ip}`, 5, 900, 120);
    await throttle(`contact:email:${data.email.toLowerCase()}`, 5, 3600, 300);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      client_ip: ip.slice(0, 60),
    });
    if (error) rethrowSafe(error, "Votre message n'a pas pu être enregistré.");
    return { ok: true };
  });

export interface AdminMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminMessage[]> => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) rethrowSafe(error, "Impossible de charger les messages.");
    return (data ?? []).map((row: Record<string, any>) => ({
      id: row["id"],
      fullName: row["full_name"],
      email: row["email"],
      phone: row["phone"] ?? "",
      subject: row["subject"] ?? "",
      message: row["message"],
      status: row["status"],
      createdAt: row["created_at"],
    }));
  });

export const updateMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(MESSAGE_STATUSES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("contact_messages")
      .update({
        status: data.status,
        handled_by: context.userId,
        handled_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) rethrowSafe(error, "Le message n'a pas pu être mis à jour.");
    await logAudit(context, {
      action: "message.status",
      entityType: "contact_message",
      entityId: data.id,
      after: { status: data.status },
    });
    return { ok: true };
  });
