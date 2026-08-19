import { createFileRoute } from "@tanstack/react-router";

import { CatalogView } from "@/components/catalog/CatalogView";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { products } from "@/data/products";
import { categoryMap } from "@/data/categories";

export const Route = createFileRoute("/produits/")({
  validateSearch: (search: Record<string, unknown>): { q?: string; categorie?: string } => ({
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
    ...(typeof search["categorie"] === "string" ? { categorie: search["categorie"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Catalogue produits — Mark Computer" },
      {
        name: "description",
        content:
          "Tout le matériel informatique Mark Computer : composants, périphériques, écrans, laptops et PC gaming, avec filtres détaillés.",
      },
      { property: "og:title", content: "Catalogue produits — Mark Computer" },
      {
        property: "og:description",
        content: "Composants, périphériques, écrans et PC gaming disponibles à Blida.",
      },
      { property: "og:url", content: "/produits" },
    ],
    links: [{ rel: "canonical", href: "/produits" }],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { q, categorie } = Route.useSearch();
  const category = categorie && categorie in categoryMap ? categorie : undefined;

  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Produits" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
        {category ? categoryMap[category as keyof typeof categoryMap].name : "Catalogue"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {products.length} références en magasin et sur commande. Prix et disponibilités indicatifs —
        confirmez avec le magasin avant votre déplacement.
      </p>

      <div className="mt-10">
        <CatalogView products={products} initialCategory={category} initialQuery={q ?? ""} />
      </div>
    </div>
  );
}
