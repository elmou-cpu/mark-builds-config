import { createFileRoute } from "@tanstack/react-router";
import { Laptop } from "lucide-react";

import { CatalogView } from "@/components/catalog/CatalogView";
import { SectionHeading } from "@/components/common/SectionHeading";
import { productsByCategory } from "@/data/products";
import { img } from "@/data/images";

export const Route = createFileRoute("/laptops")({
  head: () => ({
    meta: [
      { title: "Laptops & ultrabooks — Mark Computer Blida" },
      {
        name: "description",
        content:
          "Ordinateurs portables gaming, bureautique et ultrabooks : ASUS, HP, Lenovo, Dell et MSI, disponibles à Blida ou sur commande.",
      },
      { property: "og:title", content: "Laptops & ultrabooks — Mark Computer" },
      {
        property: "og:description",
        content: "Portables gaming, bureautique et ultrabooks disponibles chez Mark Computer.",
      },
      { property: "og:url", content: "/laptops" },
    ],
    links: [{ rel: "canonical", href: "/laptops" }],
  }),
  component: LaptopsPage,
});

function LaptopsPage() {
  const laptops = productsByCategory("laptops");

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img src={img.laptop} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        <div className="container relative py-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
            <Laptop className="h-3.5 w-3.5 text-brand-blue" /> Mobilité
          </p>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Laptops & ultrabooks</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Du portable bureautique au laptop gaming RTX. Comparez processeur, RAM, stockage et
            taille d'écran en un coup d'œil.
          </p>
        </div>
      </section>

      <div className="container py-12">
        <SectionHeading eyebrow={`${laptops.length} modèles`} title="Choisir son portable" />
        <div className="mt-8">
          <CatalogView products={laptops} showCategories={false} />
        </div>
      </div>
    </div>
  );
}
