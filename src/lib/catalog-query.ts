import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import type { Product } from "@/data/types";
import { getCatalog, type CatalogPayload } from "./catalog.functions";

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 30_000,
});

export function useCatalog(): CatalogPayload {
  return useSuspenseQuery(catalogQueryOptions).data;
}

export function useProducts(): Product[] {
  return useCatalog().products;
}

/** Derived views over the catalog — same contracts the static data module exposed. */
export const featuredOf = (products: Product[]) => products.filter((p) => p.featured).slice(0, 8);

export const dealsOf = (products: Product[]) =>
  products.filter((p) => p.oldPrice && p.oldPrice > p.price);

export const usedOf = (products: Product[]) => products.filter((p) => p.condition !== "neuf");

export const byCategoryOf = (products: Product[], categoryId: string) =>
  products.filter((p) => p.category === categoryId);

export const bySlugOf = (products: Product[], slug: string) =>
  products.find((p) => p.slug === slug);

/** Non-suspending variant for always-mounted UI (header search, cart provider). */
export function useProductsSafe(): Product[] {
  return useQuery(catalogQueryOptions).data?.products ?? [];
}
