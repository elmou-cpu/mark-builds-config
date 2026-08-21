import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, ShieldCheck, Wrench } from "lucide-react";

import { CatalogView } from "@/components/catalog/CatalogView";
import { SectionHeading } from "@/components/common/SectionHeading";
import { usedProducts } from "@/data/products";

export const Route = createFileRoute("/occasion")({
  head: () => ({
    meta: [
      { title: "Matériel d'occasion vérifié — Mark Computer" },
      {
        name: "description",
        content:
          "Cartes graphiques, laptops et composants d'occasion testés en atelier chez Mark Computer à Blida. État précisé pour chaque pièce.",
      },
      { property: "og:title", content: "Matériel d'occasion vérifié — Mark Computer" },
      {
        property: "og:description",
        content: "Composants et laptops d'occasion testés en atelier, à petit prix.",
      },
      { property: "og:url", content: "/occasion" },
    ],
    links: [{ rel: "canonical", href: "/occasion" }],
  }),
  component: UsedPage,
});

const points = [
  { icon: Wrench, title: "Testé en atelier", text: "Chaque pièce passe un test de fonctionnement." },
  { icon: ShieldCheck, title: "État annoncé", text: "Occasion ou comme neuf, indiqué sur la fiche." },
  {
    icon: RefreshCw,
    title: "Reprise possible",
    text: "Nous étudions la reprise de votre ancien matériel.",
  },
];

function UsedPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Matériel d'occasion</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Une seconde vie pour du bon matériel : composants et portables vérifiés, à prix réduits.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {points.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-surface/50 p-5">
            <p.icon className="h-5 w-5 text-brand-blue" />
            <p className="mt-3 text-sm font-semibold">{p.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <SectionHeading eyebrow={`${usedProducts.length} pièces`} title="Disponible en occasion" />
        <div className="mt-8">
          <CatalogView products={usedProducts} />
        </div>
      </div>
    </div>
  );
}
