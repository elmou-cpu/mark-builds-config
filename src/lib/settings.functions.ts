import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe } from "./errors";

export interface StoreSettings {
  deliveryFee: number;
  freeDeliveryThreshold: number | null;
  taxRate: number;
  defaultLowStockThreshold: number;
  notificationEmail: string;
}

const settingsSchema = z.object({
  deliveryFee: z.number().min(0).max(1000000),
  freeDeliveryThreshold: z.number().min(0).max(100000000).nullable(),
  taxRate: z.number().min(0).max(1),
  defaultLowStockThreshold: z.number().int().min(0).max(1000),
  notificationEmail: z.string().email().max(200).or(z.literal("")),
});

/** Public shipping/tax rules used to preview totals in the cart. */
export const getPublicStoreSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Pick<StoreSettings, "deliveryFee" | "freeDeliveryThreshold" | "taxRate">> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("store_settings")
      .select("delivery_fee, free_delivery_threshold, tax_rate")
      .maybeSingle();
    return {
      deliveryFee: Number(data?.delivery_fee ?? 1200),
      freeDeliveryThreshold:
        data?.free_delivery_threshold === null || data?.free_delivery_threshold === undefined
          ? null
          : Number(data.free_delivery_threshold),
      taxRate: Number(data?.tax_rate ?? 0),
    };
  },
);

export const getStoreSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StoreSettings> => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("store_settings").select("*").maybeSingle();
    if (error) rethrowSafe(error, "Impossible de charger les réglages.");
    return {
      deliveryFee: Number(data?.delivery_fee ?? 1200),
      freeDeliveryThreshold:
        data?.free_delivery_threshold === null || data?.free_delivery_threshold === undefined
          ? null
          : Number(data.free_delivery_threshold),
      taxRate: Number(data?.tax_rate ?? 0),
      defaultLowStockThreshold: Number(data?.default_low_stock_threshold ?? 3),
      notificationEmail: data?.notification_email ?? "",
    };
  });

export const updateStoreSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("store_settings")
      .update({
        delivery_fee: data.deliveryFee,
        free_delivery_threshold: data.freeDeliveryThreshold,
        tax_rate: data.taxRate,
        default_low_stock_threshold: data.defaultLowStockThreshold,
        notification_email: data.notificationEmail,
      })
      .eq("id", true);
    if (error) rethrowSafe(error, "Les réglages n'ont pas pu être enregistrés.");
    await logAudit(context, { action: "settings.update", entityType: "settings", after: data });
    return { ok: true };
  });
