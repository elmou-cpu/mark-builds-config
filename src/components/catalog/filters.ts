import type { Product, ProductStatus } from "@/data/types";

export interface Filters {
  categories: string[];
  brands: string[];
  price: [number, number];
  availability: ProductStatus[];
  conditions: string[];
  attrs: Record<string, string[]>;
}

export type SortKey = "pertinence" | "prix-asc" | "prix-desc" | "nouveautes";

export const sortLabels: Record<SortKey, string> = {
  pertinence: "Pertinence",
  "prix-asc": "Prix croissant",
  "prix-desc": "Prix décroissant",
  nouveautes: "Nouveautés",
};

export const availabilityOptions: { value: ProductStatus; label: string }[] = [
  { value: "disponible", label: "Disponible" },
  { value: "sur-commande", label: "Sur commande" },
  { value: "configuration", label: "Configuration uniquement" },
  { value: "nous-contacter", label: "Nous contacter" },
  { value: "rupture", label: "Rupture de stock" },
];

export const conditionOptions = [
  { value: "neuf", label: "Neuf" },
  { value: "occasion", label: "Occasion" },
  { value: "comme-neuf", label: "Comme neuf" },
];

/** Attribute facets. Only rendered when the current product set uses them. */
export const facetDefs: { attr: string; label: string; suffix?: string }[] = [
  { attr: "chipset", label: "Chipset graphique" },
  { attr: "vram", label: "VRAM", suffix: " Go" },
  { attr: "platform", label: "Plateforme" },
  { attr: "socket", label: "Socket" },
  { attr: "cores", label: "Cœurs" },
  { attr: "generation", label: "Génération" },
  { attr: "memoryType", label: "Type de mémoire" },
  { attr: "capacity", label: "Capacité", suffix: " Go" },
  { attr: "frequency", label: "Fréquence", suffix: " MHz" },
  { attr: "interface", label: "Interface" },
  { attr: "cpu", label: "Processeur" },
  { attr: "ram", label: "RAM", suffix: " Go" },
  { attr: "storage", label: "Stockage", suffix: " Go" },
  { attr: "screen", label: "Taille d'écran", suffix: "\"" },
  { attr: "size", label: "Taille", suffix: "\"" },
  { attr: "resolution", label: "Résolution" },
  { attr: "refresh", label: "Rafraîchissement", suffix: " Hz" },
  { attr: "gpu", label: "Carte graphique" },
  { attr: "wattage", label: "Puissance", suffix: " W" },
  { attr: "format", label: "Format" },
];

export function priceBounds(items: Product[]): [number, number] {
  if (items.length === 0) return [0, 1000000];
  const prices = items.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}

export function emptyFilters(items: Product[]): Filters {
  return {
    categories: [],
    brands: [],
    price: priceBounds(items),
    availability: [],
    conditions: [],
    attrs: {},
  };
}

export function availableFacets(items: Product[]) {
  return facetDefs
    .map((def) => {
      const values = Array.from(
        new Set(
          items
            .map((p) => p.attributes?.[def.attr])
            .filter((v): v is string | number => v !== undefined && v !== "")
            .map(String),
        ),
      ).sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);
        return Number.isNaN(na) || Number.isNaN(nb) ? a.localeCompare(b) : na - nb;
      });
      return { ...def, values };
    })
    .filter((f) => f.values.length > 1);
}

export function matchesSearch(product: Product, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.sku,
    product.badge ?? "",
    ...product.tags,
    ...Object.values(product.specifications),
    ...Object.values(product.attributes ?? {}).map(String),
  ]
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export function applyFilters(items: Product[], filters: Filters, query: string): Product[] {
  return items.filter((p) => {
    if (!matchesSearch(p, query)) return false;
    if (filters.categories.length && !filters.categories.includes(p.category)) return false;
    if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
    if (p.price < filters.price[0] || p.price > filters.price[1]) return false;
    if (filters.availability.length && !filters.availability.includes(p.status)) return false;
    if (filters.conditions.length && !filters.conditions.includes(p.condition)) return false;
    for (const [attr, values] of Object.entries(filters.attrs)) {
      if (!values.length) continue;
      const own = p.attributes?.[attr];
      if (own === undefined || !values.includes(String(own))) return false;
    }
    return true;
  });
}

export function sortProducts(items: Product[], sort: SortKey): Product[] {
  const copy = [...items];
  switch (sort) {
    case "prix-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "prix-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "nouveautes":
      return copy.reverse();
    default:
      return copy;
  }
}

export function activeFilterCount(filters: Filters, bounds: [number, number]): number {
  let count =
    filters.categories.length +
    filters.brands.length +
    filters.availability.length +
    filters.conditions.length +
    Object.values(filters.attrs).reduce((s, v) => s + v.length, 0);
  if (filters.price[0] !== bounds[0] || filters.price[1] !== bounds[1]) count += 1;
  return count;
}
