import type { Product } from "@/data/types";

/** Admin-facing product shape: the public product plus editing-only fields. */
export interface AdminProduct extends Product {
  active: boolean;
  imagePath: string | null;
  imageUrl: string | null;
  updatedAt: string;
}

export interface ProductInput {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  price: number;
  oldPrice: number | null;
  description: string;
  stock: number;
  status: string;
  condition: string;
  badge: string | null;
  sku: string;
  tags: string[];
  featured: boolean;
  active: boolean;
  imagePath: string | null;
  specifications: Record<string, string>;
}

export const PRODUCT_STATUSES = [
  { value: "disponible", label: "Disponible" },
  { value: "rupture", label: "Rupture de stock" },
  { value: "sur-commande", label: "Sur commande" },
  { value: "configuration", label: "Configuration" },
  { value: "nous-contacter", label: "Nous contacter" },
] as const;

export const PRODUCT_CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "occasion", label: "Occasion" },
  { value: "comme-neuf", label: "Comme neuf" },
] as const;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
