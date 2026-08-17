/**
 * Frontend-only data contracts.
 * All values in src/data/* are demonstration data and are meant to be replaced
 * by a real API later without touching the UI components.
 */

export type ProductStatus =
  | "disponible"
  | "rupture"
  | "sur-commande"
  | "configuration"
  | "nous-contacter";

export type ProductCondition = "neuf" | "occasion" | "comme-neuf";

export type CategoryId =
  | "pc-gaming"
  | "laptops"
  | "cartes-graphiques"
  | "processeurs"
  | "cartes-meres"
  | "ram"
  | "ssd"
  | "ecrans"
  | "peripheriques-gaming"
  | "reseau"
  | "imprimantes"
  | "consoles"
  | "alimentations"
  | "refroidissement"
  | "boitiers";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: CategoryId;
  price: number;
  oldPrice?: number;
  currency: "DZD";
  image: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  /** Structured values used by the filter panel. */
  attributes?: Record<string, string | number>;
  stock: number;
  status: ProductStatus;
  condition: ProductCondition;
  badge?: string;
  sku: string;
  tags: string[];
  rating?: number;
  featured?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  label: string;
  image: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  excerpt: string;
  source: string;
}
