import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
    if (error) throw new Error(error.message);
    return { isAdmin: data === true, userId: context.userId };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Accès refusé");
}

/** Every product, including inactive ones — admins only. */
export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProduct[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { mapProducts } = await import("./catalog.server");
    const rows = data ?? [];
    const products = await mapProducts(rows);
    return products.map((product, index) => ({
      ...product,
      active: rows[index].active,
      imagePath: rows[index].image_path,
      imageUrl: rows[index].image_url,
      updatedAt: rows[index].updated_at,
    }));
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
    };

    if (data.id) {
      const { error } = await context.supabase.from("products").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: inserted, error } = await context.supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id as string };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
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
