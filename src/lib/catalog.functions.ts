import { createServerFn } from "@tanstack/react-start";

import type { Category, Product } from "@/data/types";

export interface CatalogPayload {
  products: Product[];
  categories: Pick<Category, "id" | "name" | "label">[];
}

/** Public catalog: active products only, read with the publishable key (anon RLS). */
export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogPayload> => {
    const { createPublicClient, mapProducts } = await import("./catalog.server");
    const supabase = createPublicClient();

    const [productsResult, categoriesResult] = await Promise.all([
      supabase.from("products").select("*").eq("active", true).order("created_at"),
      supabase.from("categories").select("id, name, label").order("sort_order"),
    ]);

    if (productsResult.error) throw new Error(productsResult.error.message);

    const products = await mapProducts(productsResult.data ?? []);
    const categories = (categoriesResult.data ?? []).map((c) => ({
      id: c.id as Category["id"],
      name: c.name,
      label: c.label,
    }));

    return { products, categories };
  },
);
