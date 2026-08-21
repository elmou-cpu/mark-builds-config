import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";

import { CatalogView } from "@/components/catalog/CatalogView";
import { SectionHeading } from "@/components/common/SectionHeading";
import { dealProducts } from "@/data/products";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions & bons plans — Mark Computer" },
      {
        name: "description",
        content:
          "Composants, périphériques et PC en promotion chez Mark Computer Blida. Remises indicatives, stock limité.",
      },
      { property: "og:title", content: "Promotions & bons plans — Mark Computer" },
      {
        property: "og:description",
        content: "Matériel informatique en promotion à Blida : composants, écrans et périphériques.",
      },
      { property: "og:url", content: "/promotions" },
    ],
    links: [{ rel: "canonical", href: "/promotions" }],
  }),
  component: DealsPage,
});

function DealsPage() {
  return (
    <div className="container py-12">
      <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
        <Tag className="h-3.5 w-3.5 text-brand-purple" /> Bons plans
      </p>
      <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Promotions en cours</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Remises appliquées sur une sélection de produits. Quantités limitées : confirmez la
        disponibilité avant votre déplacement.
      </p>

      <div className="mt-12">
        <SectionHeading
          eyebrow={`${dealProducts.length} produits remisés`}
          title="Sélection en promotion"
        />
        <div className="mt-8">
          <CatalogView products={dealProducts} />
        </div>
      </div>
    </div>
  );
}
