import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Rows3, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  priceBounds,
  sortLabels,
  sortProducts,
  type Filters,
  type SortKey,
} from "@/components/catalog/filters";
import type { Product } from "@/data/types";
import { categoryMap } from "@/data/categories";

export function CatalogView({
  products,
  initialCategory,
  initialQuery = "",
  showCategories = true,
}: {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  showCategories?: boolean;
}) {
  const bounds = useMemo(() => priceBounds(products), [products]);
  const [filters, setFilters] = useState<Filters>(() => ({
    ...emptyFilters(products),
    categories: initialCategory ? [initialCategory] : [],
  }));
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("pertinence");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFilters({
      ...emptyFilters(products),
      categories: initialCategory ? [initialCategory] : [],
    });
    setQuery(initialQuery);
  }, [products, initialCategory, initialQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(t);
  }, []);

  const results = useMemo(
    () => sortProducts(applyFilters(products, filters, query), sort),
    [products, filters, query, sort],
  );

  const reset = () => {
    setFilters(emptyFilters(products));
    setQuery("");
  };

  const activeCount = activeFilterCount(filters, bounds);

  const chips = [
    ...filters.categories.map((c) => ({
      key: `c-${c}`,
      label: categoryMap[c as keyof typeof categoryMap]?.name ?? c,
      clear: () => setFilters({ ...filters, categories: filters.categories.filter((v) => v !== c) }),
    })),
    ...filters.brands.map((b) => ({
      key: `b-${b}`,
      label: b,
      clear: () => setFilters({ ...filters, brands: filters.brands.filter((v) => v !== b) }),
    })),
    ...Object.entries(filters.attrs).flatMap(([attr, values]) =>
      values.map((v) => ({
        key: `${attr}-${v}`,
        label: String(v),
        clear: () =>
          setFilters({
            ...filters,
            attrs: { ...filters.attrs, [attr]: values.filter((x) => x !== v) },
          }),
      })),
    ),
  ];

  const panel = (
    <FilterPanel
      products={products}
      filters={filters}
      bounds={bounds}
      onChange={setFilters}
      onReset={reset}
      showCategories={showCategories}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 hide-scrollbar">
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une marque, une référence…"
            aria-label="Rechercher dans le catalogue"
            className="h-11 bg-surface/60"
          />
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="subtle" className="lg:hidden">
                  <SlidersHorizontal /> Filtres{activeCount ? ` (${activeCount})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] overflow-y-auto bg-background sm:max-w-sm">
                <SheetTitle className="mb-4">Filtres</SheetTitle>
                {panel}
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-10 w-[170px] bg-surface/60" aria-label="Trier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden items-center gap-1 rounded-md border border-border p-1 sm:flex">
              <button
                type="button"
                aria-label="Vue grille"
                onClick={() => setView("grid")}
                className={`grid h-8 w-8 place-items-center rounded ${view === "grid" ? "bg-surface-2" : ""}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Vue liste"
                onClick={() => setView("list")}
                className={`grid h-8 w-8 place-items-center rounded ${view === "list" ? "bg-surface-2" : ""}`}
              >
                <Rows3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <p className="mr-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{results.length}</span> produit
            {results.length > 1 ? "s" : ""}
          </p>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs transition-colors hover:border-border-strong"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : results.length === 0 ? (
          <EmptyState
            title="Aucun produit trouvé"
            description="Essayez une autre recherche ou modifiez vos filtres."
            action={
              <Button variant="hero" onClick={reset}>
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <ProductGrid products={results} view={view} />
        )}
      </div>
    </div>
  );
}
