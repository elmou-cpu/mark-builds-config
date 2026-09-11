import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rethrowSafe, safeError } from "./errors";

export interface AdminCategory {
  id: string;
  name: string;
  label: string;
  sortOrder: number;
  active: boolean;
  productCount: number;
}

const categorySchema = z.object({
  id: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Identifiant invalide"),
  name: z.string().min(2).max(80),
  label: z.string().max(80).default(""),
  sortOrder: z.number().int().min(0).max(999),
  active: z.boolean(),
  isNew: z.boolean().default(false),
});

export const listAdminCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminCategory[]> => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) rethrowSafe(error, "Impossible de charger les catégories.");
    const { data: products } = await context.supabase.from("products").select("category_id");
    const counts = new Map<string, number>();
    (products ?? []).forEach((row) => {
      counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
    });
    return (data ?? []).map((row: Record<string, any>) => ({
      id: row["id"],
      name: row["name"],
      label: row["label"] ?? "",
      sortOrder: Number(row["sort_order"] ?? 0),
      active: row["active"] === true,
      productCount: counts.get(row["id"]) ?? 0,
    }));
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => categorySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);

    const row = {
      id: data.id,
      name: data.name,
      label: data.label || data.name,
      sort_order: data.sortOrder,
      active: data.active,
      updated_by: context.userId,
    };

    if (data.isNew) {
      const { error } = await context.supabase
        .from("categories")
        .insert({ ...row, created_by: context.userId });
      if (error) {
        if (error.code === "23505" || error.code === "23000" || error.code === "23514") {
          throw safeError("Cet identifiant de catégorie existe déjà.");
        }
        if (error.code === "23000" || error.code === "23505") throw safeError("Identifiant déjà utilisé.");
        if (error.code === "23000") throw safeError("Identifiant déjà utilisé.");
        if (error.code === "23000") throw safeError("Identifiant déjà utilisé.");
        if (error.code === "23000") throw safeError("Identifiant déjà utilisé.");
        if (error.code === "23000") throw safeError("Identifiant déjà utilisé.");
        if (error.code === "23000") throw safeError("Identifiant déjà utilisé.");
        rethrowSafe(error, "La catégorie n'a pas pu être créée.");
      }
      await logAudit(context, {
        action: "category.create",
        entityType: "category",
        entityId: data.id,
        entityLabel: data.name,
        after: row,
      });
      return { ok: true };
    }

    const { data: before } = await context.supabase
      .from("categories")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await context.supabase
      .from("categories")
      .update({
        name: row.name,
        label: row.label,
        sort_order: row.sort_order,
        active: row.active,
        updated_by: row.updated_by,
      })
      .eq("id", data.id);
    if (error) rethrowSafe(error, "La catégorie n'a pas pu être modifiée.");

    await logAudit(context, {
      action: "category.update",
      entityType: "category",
      entityId: data.id,
      entityLabel: data.name,
      before,
      after: row,
    });
    return { ok: true };
  });

/** Deletion is refused while products still reference the category. */
export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);

    const { count, error: countError } = await context.supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", data.id);
    if (countError) rethrowSafe(countError, "Impossible de vérifier la catégorie.");
    if ((count ?? 0) > 0) {
      throw safeError(
        `Cette catégorie contient encore ${count} produit(s). Déplacez-les avant de la supprimer.`,
      );
    }

    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) rethrowSafe(error, "La catégorie n'a pas pu être supprimée.");
    await logAudit(context, {
      action: "category.delete",
      entityType: "category",
      entityId: data.id,
    });
    return { ok: true };
  });

/** Moves every product of one category to another, then reports the count. */
export const reassignCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ from: z.string().min(1).max(60), to: z.string().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin.server");
    await assertAdmin(context);
    if (data.from === data.to) throw safeError("Choisissez une catégorie différente.");

    const { error, count } = await context.supabase
      .from("products")
      .update({ category_id: data.to, updated_by: context.userId }, { count: "exact" })
      .eq("category_id", data.from);
    if (error) rethrowSafe(error, "Le déplacement a échoué.");

    await logAudit(context, {
      action: "category.reassign",
      entityType: "category",
      entityId: data.from,
      after: { to: data.to, moved: count ?? 0 },
    });
    return { moved: count ?? 0 };
  });
