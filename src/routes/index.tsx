import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, Headphones, ShieldCheck, Sparkles, Truck, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { CategoryCard } from "@/components/common/CategoryCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ReviewCard } from "@/components/common/ReviewCard";
import { categoryMap, homeCategoryIds } from "@/data/categories";
import {
  byCategoryOf,
  catalogQueryOptions,
  featuredOf,
  useProducts,
} from "@/lib/catalog-query";
import { reviews, ratingSummary } from "@/data/reviews";
import { brands } from "@/data/brands";
import { site } from "@/data/site";
import { img } from "@/data/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mark Computer — Matériel informatique & PC gaming à Blida" },
      {
        name: "description",
        content:
          "Composants, PC gaming, laptops et périphériques à Blida. Configurateur PC en ligne, montage en atelier et livraison dans les 58 wilayas.",
      },
      { property: "og:title", content: "Mark Computer — Matériel informatique à Blida" },
      {
        property: "og:description",
        content:
          "Composants, PC gaming, laptops et périphériques. Configurateur PC et montage en atelier à Blida.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catalogQueryOptions);
  },
  component: Home,
});

const trust = [
  { icon: Truck, title: `Livraison ${site.wilayas} wilayas`, text: "Expédition rapide partout en Algérie." },
  { icon: Wrench, title: "Montage en atelier", text: "Assemblage, câblage et tests avant livraison." },
  { icon: ShieldCheck, title: "Matériel garanti", text: "Produits d'origine, garantie constructeur." },
  { icon: Headphones, title: "Conseil technique", text: "Une équipe qui connaît le hardware." },
];

function Home() {
  const products = useProducts();
  const featuredProducts = featuredOf(products);
  const gamingPcs = byCategoryOf(products, "pc-gaming").slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={img.rig}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="container relative grid gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="reveal">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
              Spécialiste hardware à {site.city}
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl xl:text-6xl">
              Le matériel qui fait
              <span className="text-gradient-brand"> tourner vos projets.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Composants, PC gaming, laptops et périphériques sélectionnés pièce par pièce. Montage,
              conseil et maintenance par une équipe basée à {site.city}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/pc-builder">
                  <Cpu /> Configurer mon PC
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/produits">
                  Voir le catalogue <ArrowRight />
                </Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <dt className="text-xs text-muted-foreground">Note Google</dt>
                <dd className="font-display text-2xl font-bold">{ratingSummary.average}/5</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Références</dt>
                <dd className="font-display text-2xl font-bold">300+</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Wilayas livrées</dt>
                <dd className="font-display text-2xl font-bold">{site.wilayas}</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-lift">
              <img
                src={img.gpu}
                alt="Carte graphique haut de gamme"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="surface-panel absolute -bottom-6 left-4 right-4 rounded-xl p-4 sm:left-8 sm:right-8">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Configurateur intelligent
              </p>
              <p className="mt-1 text-sm">
                Vérification socket, mémoire, alimentation et longueur GPU en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/30">
        <div className="container grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2">
                <item.icon className="h-5 w-5 text-brand-blue" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading
          eyebrow="Catalogue"
          title="Explorer par catégorie"
          subtitle="Tout le matériel, du composant au poste complet."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {homeCategoryIds.map((id) => (
            <CategoryCard key={id} category={categoryMap[id]} />
          ))}
        </div>
      </section>

      <section className="container py-4">
        <SectionHeading
          eyebrow="Sélection"
          title="Produits en vedette"
          subtitle="Les références les plus demandées en magasin."
          action={
            <Button variant="subtle" asChild>
              <Link to="/produits">Tout voir</Link>
            </Button>
          }
        />
        <ProductGrid products={featuredProducts} className="mt-8" />
      </section>

      <section className="container py-16">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img src={img.parts} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Montez votre configuration, pièce par pièce
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Le configurateur vous guide du processeur au boîtier, vérifie les compatibilités
                essentielles et estime la consommation. Envoyez ensuite votre config au magasin.
              </p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/pc-builder">
                Ouvrir le configurateur <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-4">
        <SectionHeading
          eyebrow="Gaming"
          title="PC gaming prêts à jouer"
          action={
            <Button variant="subtle" asChild>
              <Link to="/gaming">Univers gaming</Link>
            </Button>
          }
        />
        <ProductGrid products={gamingPcs} className="mt-8" />
      </section>

      <section className="container py-16">
        <SectionHeading
          eyebrow="Bons plans"
          title="Promotions en cours"
          action={
            <Button variant="subtle" asChild>
              <Link to="/promotions">Toutes les promos</Link>
            </Button>
          }
        />
        <ProductGrid products={dealProducts.slice(0, 4)} className="mt-8" />
      </section>

      <section className="border-y border-border bg-surface/30 py-10">
        <div className="container">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Marques distribuées
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {brands.map((brand) => (
              <li key={brand} className="font-display text-sm font-semibold text-muted-foreground">
                {brand}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading
          eyebrow="Avis clients"
          title={`${ratingSummary.average}/5 sur ${ratingSummary.count} avis ${ratingSummary.source}`}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </>
  );
}
