import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { CategoryId, Product, ProductCondition, ProductStatus } from "@/data/types";

export const PRODUCT_BUCKET = "product-images";
const SIGN_TTL = 60 * 60 * 24 * 7;

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/** Publishable-key client for public reads (RLS applies as anon). */
export function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Signs private storage paths so the public site can render the images. */
export async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return {};
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage
    .from(PRODUCT_BUCKET)
    .createSignedUrls(unique, SIGN_TTL);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((entry, index) => {
    const path = entry.path ?? unique[index];
    if (path && entry.signedUrl) map[path] = entry.signedUrl;
  });
  return map;
}

const asStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
  );
};

const asAttributes = (value: unknown): Record<string, string | number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" || typeof v === "number")
      .map(([k, v]) => [k, v as string | number]),
  );
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

export function mapProduct(row: ProductRow, urls: Record<string, string>): Product {
  const paths = asStringArray(row.image_paths);
  const primary =
    (row.image_path ? urls[row.image_path] : undefined) ??
    row.image_url ??
    (paths.length > 0 ? urls[paths[0]!] : undefined) ??
    "";
  const gallery = paths.map((p) => urls[p]).filter((u): u is string => Boolean(u));
  const attributes = asAttributes(row.attributes);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: row.category_id as CategoryId,
    price: Number(row.price),
    ...(row.old_price !== null ? { oldPrice: Number(row.old_price) } : {}),
    currency: "DZD",
    image: primary,
    images: gallery.length > 0 ? gallery : primary ? [primary] : [],
    description: row.description,
    specifications: asStringRecord(row.specifications),
    ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
    stock: row.stock,
    status: row.status as ProductStatus,
    condition: row.condition as ProductCondition,
    ...(row.badge ? { badge: row.badge } : {}),
    sku: row.sku,
    tags: asStringArray(row.tags),
    ...(row.rating !== null ? { rating: Number(row.rating) } : {}),
    featured: row.featured,
  };
}

export async function mapProducts(rows: ProductRow[]): Promise<Product[]> {
  const paths = rows.flatMap((row) => [
    ...(row.image_path ? [row.image_path] : []),
    ...asStringArray(row.image_paths),
  ]);
  const urls = await signPaths(paths);
  return rows.map((row) => mapProduct(row, urls));
}
