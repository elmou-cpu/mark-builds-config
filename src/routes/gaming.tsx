import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gamepad2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CatalogView } from "@/components/catalog/CatalogView";
import { catalogQueryOptions, useProducts } from "@/lib/catalog-query";
import { img } from "@/data/images";

export const Route = createFileRoute("/gaming")({
  head: () => ({
    meta: [
      { title: "Univers Gaming — PC, périphériques & consoles | Mark Computer" },
      {
        name: "description",
        content:
          "PC gaming assemblés, cartes graphiques, périphériques RGB, écrans haute fréquence et consoles disponibles chez Mark Computer à Blida.",
      },
      { property: "og:title", content: "Univers Gaming — Mark Computer" },
      {
        property: "og:description",
        content: "PC gaming, GPU, périphériques et écrans haute fréquence à Blida.",
      },
      { property: "og:url", content: "/gaming" },
    ],
    links: [{ rel: "canonical", href: "/gaming" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQueryOptions);
  },
  component: GamingPage,
});

const gamingCategories = [
  "pc-gaming",
  "cartes-graphiques",
  "peripheriques-gaming",
  "ecrans",
  "consoles",
];

function GamingPage() {
  const products = useProducts();
  const gaming = products.filter((p) => gamingCategories.includes(p.category));

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img src={img.rig} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        <div className="container relative py-16 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
            <Gamepad2 className="h-3.5 w-3.5 text-brand-purple" /> Setup gaming
          </p>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold sm:text-5xl">
            Des configs qui tiennent <span className="text-gradient-brand">les 144 FPS</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            PC assemblés et testés, cartes graphiques dernières générations, écrans haute fréquence
            et périphériques mécaniques.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/pc-builder">
                Configurer mon PC gaming <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <SectionHeading
          eyebrow={`${gaming.length} références`}
          title="Tout l'univers gaming"
          subtitle="Filtrez par catégorie, chipset, résolution ou fréquence."
        />
        <div className="mt-8">
          <CatalogView products={gaming} />
        </div>
      </div>
    </div>
  );
}
