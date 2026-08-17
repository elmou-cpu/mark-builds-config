import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { categories } from "@/data/categories";
import { formatPrice } from "@/lib/format";
import {
  availabilityOptions,
  conditionOptions,
  availableFacets,
  type Filters,
} from "@/components/catalog/filters";
import type { Product, ProductStatus } from "@/data/types";

interface Props {
  products: Product[];
  filters: Filters;
  bounds: [number, number];
  onChange: (next: Filters) => void;
  onReset: () => void;
  showCategories?: boolean;
}

function Row({
  id,
  label,
  checked,
  onToggle,
  count,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-xs opacity-60">{count}</span>}
    </label>
  );
}

export function FilterPanel({
  products,
  filters,
  bounds,
  onChange,
  onReset,
  showCategories = true,
}: Props) {
  const usedCategories = categories.filter((c) => products.some((p) => p.category === c.id));
  const usedBrands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const facets = availableFacets(products);

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em]">Filtres</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Prix
        </p>
        <Slider
          value={filters.price}
          min={bounds[0]}
          max={bounds[1]}
          step={1000}
          onValueChange={(value) =>
            onChange({ ...filters, price: [value[0] ?? bounds[0], value[1] ?? bounds[1]] })
          }
          aria-label="Fourchette de prix"
        />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.price[0])}</span>
          <span>{formatPrice(filters.price[1])}</span>
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["disponibilite", "marque", ...(showCategories ? ["categorie"] : [])]}
        className="rounded-xl border border-border bg-surface/50 px-4"
      >
        {showCategories && (
          <AccordionItem value="categorie">
            <AccordionTrigger className="text-sm">Catégorie</AccordionTrigger>
            <AccordionContent>
              {usedCategories.map((c) => (
                <Row
                  key={c.id}
                  id={`cat-${c.id}`}
                  label={c.name}
                  count={products.filter((p) => p.category === c.id).length}
                  checked={filters.categories.includes(c.id)}
                  onToggle={() =>
                    onChange({ ...filters, categories: toggle(filters.categories, c.id) })
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="marque">
          <AccordionTrigger className="text-sm">Marque</AccordionTrigger>
          <AccordionContent className="max-h-64 overflow-y-auto">
            {usedBrands.map((b) => (
              <Row
                key={b}
                id={`brand-${b}`}
                label={b}
                count={products.filter((p) => p.brand === b).length}
                checked={filters.brands.includes(b)}
                onToggle={() => onChange({ ...filters, brands: toggle(filters.brands, b) })}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disponibilite">
          <AccordionTrigger className="text-sm">Disponibilité</AccordionTrigger>
          <AccordionContent>
            {availabilityOptions
              .filter((o) => products.some((p) => p.status === o.value))
              .map((o) => (
                <Row
                  key={o.value}
                  id={`av-${o.value}`}
                  label={o.label}
                  checked={filters.availability.includes(o.value)}
                  onToggle={() =>
                    onChange({
                      ...filters,
                      availability: toggle<ProductStatus>(filters.availability, o.value),
                    })
                  }
                />
              ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="etat">
          <AccordionTrigger className="text-sm">État</AccordionTrigger>
          <AccordionContent>
            {conditionOptions
              .filter((o) => products.some((p) => p.condition === o.value))
              .map((o) => (
                <Row
                  key={o.value}
                  id={`cond-${o.value}`}
                  label={o.label}
                  checked={filters.conditions.includes(o.value)}
                  onToggle={() =>
                    onChange({ ...filters, conditions: toggle(filters.conditions, o.value) })
                  }
                />
              ))}
          </AccordionContent>
        </AccordionItem>

        {facets.map((facet) => (
          <AccordionItem key={facet.attr} value={facet.attr}>
            <AccordionTrigger className="text-sm">{facet.label}</AccordionTrigger>
            <AccordionContent className="max-h-56 overflow-y-auto">
              {facet.values.map((value) => (
                <Row
                  key={value}
                  id={`${facet.attr}-${value}`}
                  label={`${value}${facet.suffix ?? ""}`}
                  checked={(filters.attrs[facet.attr] ?? []).includes(value)}
                  onToggle={() =>
                    onChange({
                      ...filters,
                      attrs: {
                        ...filters.attrs,
                        [facet.attr]: toggle(filters.attrs[facet.attr] ?? [], value),
                      },
                    })
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
