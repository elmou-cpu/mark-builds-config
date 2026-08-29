import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, Headphones, MapPin, ShieldCheck, Truck, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ReviewCard } from "@/components/common/ReviewCard";
import { reviews, ratingSummary } from "@/data/reviews";
import { site } from "@/data/site";
import { img } from "@/data/images";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Mark Computer, magasin informatique à Blida" },
      {
        name: "description",
        content:
          "Mark Computer accompagne particuliers, gamers et entreprises à Blida : vente de matériel, montage de configurations sur mesure et maintenance.",
      },
      { property: "og:title", content: "À propos — Mark Computer" },
      {
        property: "og:description",
        content: "Magasin informatique à Blida : vente, montage sur mesure et maintenance.",
      },
      { property: "og:url", content: "/a-propos" },
    ],
    links: [{ rel: "canonical", href: "/a-propos" }],
  }),
  component: AboutPage,
});

const services = [
  { icon: Cpu, title: "Vente de composants", text: "Processeurs, GPU, RAM, stockage, boîtiers et alimentations." },
  { icon: Wrench, title: "Montage sur mesure", text: "Assemblage, câblage soigné, tests de stabilité avant livraison." },
  { icon: Headphones, title: "Conseil & devis", text: "Nous adaptons la config à votre usage et votre budget." },
  { icon: ShieldCheck, title: "Maintenance & SAV", text: "Diagnostic, nettoyage, remplacement de pièces, réinstallation." },
  { icon: Truck, title: "Livraison nationale", text: `Expédition vers les ${site.wilayas} wilayas.` },
  { icon: MapPin, title: "Retrait au magasin", text: `Sur place à ${site.city}, ${site.hours}.` },
];

function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img src={img.parts} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        <div className="container relative py-14">
          <Breadcrumbs items={[{ label: "À propos" }]} />
          <h1 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
            Le hardware, c'est notre métier depuis l'atelier de {site.city}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {site.name} conseille particuliers, joueurs, étudiants et entreprises. Nous sélectionnons
            du matériel fiable, nous le montons nous-mêmes et nous restons disponibles après l'achat.
          </p>
        </div>
      </section>

      <div className="container py-14">
        <SectionHeading eyebrow="Services" title="Ce que nous faisons" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-surface/50 p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2">
                <s.icon className="h-5 w-5 text-brand-blue" />
              </div>
              <p className="mt-4 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 rounded-2xl border border-border bg-surface/40 p-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-3xl font-bold">{ratingSummary.average}/5</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ratingSummary.count} avis {ratingSummary.source}
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold">{site.wilayas}</p>
            <p className="mt-1 text-xs text-muted-foreground">wilayas livrées</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold">{site.hours}</p>
            <p className="mt-1 text-xs text-muted-foreground">ouvert tous les jours</p>
          </div>
        </div>

        <div className="mt-14">
          <SectionHeading eyebrow="Avis" title="Ce que disent nos clients" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Button variant="hero" size="lg" asChild>
            <Link to="/contact">Demander un devis</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/pc-builder">Configurer un PC</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
