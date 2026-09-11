import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe, safeError } from "./errors";
import type { AdminProduct } from "./catalog-types";

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  brand: z.string().max(120).default(""),
  categoryId: z.string().min(1),
  price: z.number().min(0),
  oldPrice: z.number().min(0).nullable(),
  description: z.string().max(4000).default(""),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).max(1000).default(3),
  status: z.enum(["disponible", "rupture", "sur-commande", "configuration", "nous-contacter"]),
  condition: z.enum(["neuf", "occasion", "comme-neuf"]),
  badge: z.string().max(40).nullable(),
  sku: z.string().max(60).default(""),
  tags: z.array(z.string().max(40)).max(20).default([]),
  featured: z.boolean(),
  active: z.boolean(),
  imagePath: z.string().max(400).nullable(),
  specifications: z.record(z.string(), z.string()).default({}),
});

/** Tells the client whether the signed-in user holds the admin role. */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) rethrowSafe(error, "Impossible de vérifier vos droits.");
    return { isAdmin: data === true, userId: context.userId };
  });

import { assertAdmin, logAudit } from "./admin.server";

/** Every product, including inactive ones — admins only. */
export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProduct[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) rethrowSafe(error, "Impossible de charger les produits.");
    const { mapProducts } = await import("./catalog.server");
    const rows = (data ?? []) as Array<Record<string, any>>;
    const products = await mapProducts(rows as any);
    return products.map((product, index) => {
      const row = rows[index] ?? {};
      return {
        ...product,
        active: row["active"] === true,
        imagePath: (row["image_path"] as string | null) ?? null,
        imageUrl: (row["image_url"] as string | null) ?? null,
        updatedAt: (row["updated_at"] as string | undefined) ?? "",
        lowStockThreshold: Number(row["low_stock_threshold"] ?? 3),
      };
    });
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = {
      name: data.name,
      slug: data.slug,
      brand: data.brand,
      category_id: data.categoryId,
      price: data.price,
      old_price: data.oldPrice,
      description: data.description,
      stock: data.stock,
      status: data.status,
      condition: data.condition,
      badge: data.badge,
      sku: data.sku,
      tags: data.tags,
      featured: data.featured,
      active: data.active,
      image_path: data.imagePath,
      image_paths: data.imagePath ? [data.imagePath] : [],
      specifications: data.specifications,
      low_stock_threshold: data.lowStockThreshold,
      updated_by: context.userId,
    };

    if (data.id) {
      const { data: before } = await context.supabase
        .from("products")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      const { error } = await context.supabase
        .from("products")
        .update(row as never)
        .eq("id", data.id);
      if (error) {
        if (error.code === "23505") throw safeError("Cette référence d'URL est déjà utilisée.");
        rethrowSafe(error, "Le produit n'a pas pu être enregistré.");
      }

      const previousPath = (before as { image_path?: string | null } | null)?.image_path ?? null;
      if (previousPath && previousPath !== data.imagePath) {
        const { removeOrphanImage } = await import("./uploads.functions");
        await removeOrphanImage(previousPath);
      }

      await logAudit(context, {
        action: "product.update",
        entityType: "product",
        entityId: data.id,
        entityLabel: data.name,
        before,
        after: row,
      });
      return { id: data.id };
    }

    const { data: inserted, error } = await context.supabase
      .from("products")
      .insert({ ...row, created_by: context.userId } as never)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw safeError("Cette référence d'URL est déjà utilisée.");
      rethrowSafe(error, "Le produit n'a pas pu être créé.");
    }
    await logAudit(context, {
      action: "product.create",
      entityType: "product",
      entityId: inserted.id as string,
      entityLabel: data.name,
      after: row,
    });
    return { id: inserted.id as string };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: before } = await context.supabase
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) rethrowSafe(error, "Le produit n'a pas pu être supprimé.");

    const path = (before as { image_path?: string | null } | null)?.image_path ?? null;
    const { removeOrphanImage } = await import("./uploads.functions");
    await removeOrphanImage(path);

    await logAudit(context, {
      action: "product.delete",
      entityType: "product",
      entityId: data.id,
      entityLabel: (before as { name?: string } | null)?.name ?? "",
      before,
    });
    return { ok: true };
  });

/** Short-lived signed URL so the admin form can preview a freshly uploaded image. */
export const getImagePreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ path: z.string().min(1).max(400) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { signPaths } = await import("./catalog.server");
    const urls = await signPaths([data.path]);
    return { url: urls[data.path] ?? null };
  });
