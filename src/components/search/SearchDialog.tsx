import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Clock, Flame } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { products } from "@/data/products";
import { matchesSearch } from "@/components/catalog/filters";
import { formatPrice } from "@/lib/format";

const POPULAR = ["RTX 5070", "Ryzen 5", "DDR5", "SSD NVMe", "Casque gaming", "Laptop ASUS"];
const RECENT_KEY = "mc.recentSearches.v1";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, [open]);

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const results = query.trim() ? products.filter((p) => matchesSearch(p, query)).slice(0, 8) : [];

  const openProduct = (slug: string) => {
    if (query.trim()) remember(query.trim());
    onOpenChange(false);
    setQuery("");
    navigate({ to: "/produits/$slug", params: { slug } });
  };

  const runSearch = (term: string) => {
    remember(term);
    onOpenChange(false);
    setQuery("");
    navigate({ to: "/produits", search: { q: term } });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Rechercher un produit, une marque, un composant…"
      />
      <CommandList className="max-h-[60vh]">
        {query.trim() && results.length === 0 && (
          <CommandEmpty>Aucun produit trouvé pour « {query} ».</CommandEmpty>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Produits">
            {results.map((p) => (
              <CommandItem key={p.id} value={p.id} onSelect={() => openProduct(p.slug)}>
                <img src={p.image} alt="" className="mr-3 h-9 w-9 rounded object-cover" />
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-xs text-muted-foreground">{p.brand} · </span>
                  {p.name}
                </span>
                <span className="ml-3 shrink-0 text-xs font-semibold">{formatPrice(p.price)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query.trim() && results.length > 0 && (
          <CommandGroup>
            <CommandItem value="all-results" onSelect={() => runSearch(query.trim())}>
              <Search className="mr-2 h-4 w-4" />
              Voir tous les résultats pour « {query} »
            </CommandItem>
          </CommandGroup>
        )}

        {!query.trim() && recent.length > 0 && (
          <CommandGroup heading="Recherches récentes">
            {recent.map((term) => (
              <CommandItem key={term} value={`recent-${term}`} onSelect={() => runSearch(term)}>
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {term}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!query.trim() && (
          <CommandGroup heading="Recherches populaires">
            {POPULAR.map((term) => (
              <CommandItem key={term} value={`pop-${term}`} onSelect={() => runSearch(term)}>
                <Flame className="mr-2 h-4 w-4 text-brand-purple" />
                {term}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
