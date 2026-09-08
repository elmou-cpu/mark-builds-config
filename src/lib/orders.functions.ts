import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe, safeError, toSafeMessage } from "./errors";

export const ORDER_STATUSES = [
  "nouvelle",
  "confirmee",
  "prete",
  "expediee",
  "livree",
  "annulee",
] as const;
export const PAYMENT_STATUSES = ["impaye", "paye", "rembourse", "echoue"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const placeOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50),
  customer: z.object({
    fullName: z.string().min(2).max(120),
    phone: z.string().min(6).max(30),
    email: z.string().email().max(200).or(z.literal("")).default(""),
    wilaya: z.string().min(2).max(60),
    address: z.string().max(300).default(""),
    notes: z.string().max(1000).default(""),
    deliveryMode: z.enum(["retrait", "livraison"]),
  }),
});

/**
 * Public checkout. The browser sends product ids and quantities only — every
 * price, the shipping fee, the tax and the total are recomputed in the database
 * inside one transaction that also locks and decrements stock.
 */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, throttle } = await import("./admin.server");
    const ip = clientIp();
    await throttle(`order:ip:${ip}`, 8, 600, 60);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("create_order", {
      p_items: data.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })) as never,
      p_customer: {
        full_name: data.customer.fullName,
        phone: data.customer.phone,
        email: data.customer.email,
        wilaya: data.customer.wilaya,
        address: data.customer.address,
        notes: data.customer.notes,
        delivery_mode: data.customer.deliveryMode,
      } as never,
      p_client_ip: ip,
    });

    if (error) {
      console.error("[orders] create failed", error);
      throw safeError(toSafeMessage(error, "La commande n'a pas pu être enregistrée."));
    }

    const payload = result as {
      order_number: string;
      subtotal: number;
      shipping_fee: number;
      tax_amount: number;
      total: number;
    };
    return {
      orderNumber: payload.order_number,
      subtotal: Number(payload.subtotal),
      shippingFee: Number(payload.shipping_fee),
      taxAmount: Number(payload.tax_amount),
      total: Number(payload.total),
    };
  });

export interface AdminOrderItem {
  id: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  wilaya: string;
  address: string;
  notes: string;
  deliveryMode: "retrait" | "livraison";
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  cancellationReason: string | null;
  createdAt: string;
  items: AdminOrderItem[];
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOrder[]> => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) rethrowSafe(error, "Impossible de charger les commandes.");
    return (data ?? []).map((row: Record<string, any>) => ({
      id: row["id"],
      orderNumber: row["order_number"],
      customerName: row["customer_name"],
      customerPhone: row["customer_phone"],
      customerEmail: row["customer_email"] ?? null,
      wilaya: row["wilaya"],
      address: row["address"] ?? "",
      notes: row["notes"] ?? "",
      deliveryMode: row["delivery_mode"],
      subtotal: Number(row["subtotal"]),
      shippingFee: Number(row["shipping_fee"]),
      taxAmount: Number(row["tax_amount"]),
      total: Number(row["total"]),
      status: row["status"],
      paymentStatus: row["payment_status"],
      cancellationReason: row["cancellation_reason"] ?? null,
      createdAt: row["created_at"],
      items: (row["order_items"] ?? []).map((item: Record<string, any>) => ({
        id: item["id"],
        productName: item["product_name"],
        productSku: item["product_sku"] ?? "",
        unitPrice: Number(item["unit_price"]),
        quantity: Number(item["quantity"]),
        lineTotal: Number(item["line_total"]),
      })),
    }));
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(ORDER_STATUSES).optional(),
        paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);
    if (data.status === "annulee") {
      throw safeError("Utilisez l'action « Annuler » pour annuler une commande.");
    }

    const { data: before, error: readError } = await context.supabase
      .from("orders")
      .select("order_number, status, payment_status")
      .eq("id", data.id)
      .single();
    if (readError) rethrowSafe(readError, "Commande introuvable.");

    const patch: Record<string, unknown> = {};
    if (data.status) patch["status"] = data.status;
    if (data.paymentStatus) {
      patch["payment_status"] = data.paymentStatus;
      patch["paid_at"] = data.paymentStatus === "paye" ? new Date().toISOString() : null;
      if (data.paymentStatus === "rembourse") patch["refunded_at"] = new Date().toISOString();
    }
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await context.supabase.from("orders").update(patch as never).eq("id", data.id);
    if (error) rethrowSafe(error, "La commande n'a pas pu être mise à jour.");

    await logAudit(context, {
      action: "order.update",
      entityType: "order",
      entityId: data.id,
      entityLabel: before?.order_number ?? "",
      before,
      after: patch,
    });
    return { ok: true };
  });

/** Cancels an order and returns its items to stock exactly once. */
export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), reason: z.string().max(500).default("") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("cancel_order", {
      p_order_id: data.id,
      p_reason: data.reason,
      p_actor: context.userId,
    });
    if (error) {
      console.error("[orders] cancel failed", error);
      throw safeError(toSafeMessage(error, "L'annulation a échoué."));
    }
    await logAudit(context, {
      action: "order.cancel",
      entityType: "order",
      entityId: data.id,
      after: { reason: data.reason },
    });
    return { ok: true };
  });
