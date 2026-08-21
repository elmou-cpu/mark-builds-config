import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  CircleDashed,
  Cpu,
  RotateCcw,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/common/SectionHeading";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  builderSteps,
  optionsForStep,
  type BuilderOption,
  type StepId,
} from "@/data/builderComponents";
import {
  checkCompatibility,
  estimatePower,
  selectionTotal,
  type Selection,
} from "@/lib/compatibility";
import { productBySlug } from "@/data/products";
import { useShop } from "@/store/shop";
import { site } from "@/data/site";

export const Route = createFileRoute("/pc-builder")({
  head: () => ({
    meta: [
      { title: "Configurateur PC — Montez votre config | Mark Computer" },
      {
        name: "description",
        content:
          "Configurez votre PC pièce par pièce : processeur, carte mère, GPU, RAM, stockage, alimentation. Vérification des compatibilités et estimation de la consommation.",
      },
      { property: "og:title", content: "Configurateur PC — Mark Computer" },
      {
        property: "og:description",
        content:
          "Choisissez vos composants, vérifiez les compatibilités et envoyez votre configuration au magasin.",
      },
      { property: "og:url", content: "/pc-builder" },
    ],
    links: [{ rel: "canonical", href: "/pc-builder" }],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const [selection, setSelection] = useState<Selection>({});
  const [activeStep, setActiveStep] = useState<StepId>("cpu");
  const { addToCart, setCartOpen } = useShop();

  const options = useMemo(() => optionsForStep(activeStep), [activeStep]);
  const checks = useMemo(() => checkCompatibility(selection), [selection]);
  const watts = estimatePower(selection);
  const total = selectionTotal(selection);

  const requiredSteps = builderSteps.filter((s) => !s.optional);
  const chosenRequired = requiredSteps.filter((s) => selection[s.id]).length;
  const progress = Math.round((chosenRequired / requiredSteps.length) * 100);
  const warnings = checks.filter((c) => c.state === "warn");

  const pick = (option: BuilderOption) => {
    setSelection((prev) => ({ ...prev, [option.step]: option }));
    const index = builderSteps.findIndex((s) => s.id === option.step);
    const next = builderSteps[index + 1];
    if (next) setActiveStep(next.id);
  };

  const clearStep = (step: StepId) => {
    setSelection((prev) => {
      const next = { ...prev };
      delete next[step];
      return next;
    });
  };

  const addConfigToCart = () => {
    const slugs = Object.values(selection)
      .map((o) => o?.slug)
      .filter((s): s is string => Boolean(s));
    let added = 0;
    for (const slug of slugs) {
      const product = productBySlug(slug);
      if (product) {
        addToCart(product.id);
        added += 1;
      }
    }
    if (added === 0) {
      toast.info("Ces pièces se commandent en magasin : appelez-nous pour finaliser.");
      return;
    }
    toast.success(
      `${added} composant${added > 1 ? "s" : ""} ajouté${added > 1 ? "s" : ""} au panier`,
    );
    setCartOpen(true);
  };

  const activeLabel = builderSteps.find((s) => s.id === activeStep)?.label ?? "Composant";

  return (
    <div className="container py-10">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5 text-brand-blue" /> Configurateur
        </p>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Montez votre PC, pièce par pièce</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Sélectionnez chaque composant : nous vérifions les points de compatibilité essentiels et
          estimons la consommation. La validation finale est toujours faite par nos techniciens.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Étapes obligatoires</span>
              <span>
                {chosenRequired}/{requiredSteps.length}
              </span>
            </div>
            <Progress value={progress} className="mt-2 h-1.5" />
          </div>
          <ol className="grid gap-1">
            {builderSteps.map((step, i) => {
              const chosen = selection[step.id];
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      activeStep === step.id
                        ? "border-border-strong bg-surface-2"
                        : "border-transparent hover:bg-surface/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                        chosen
                          ? "gradient-brand text-primary-foreground"
                          : "bg-surface-2 text-muted-foreground",
                      )}
                    >
                      {chosen ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{step.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {chosen ? chosen.name : step.optional ? "Optionnel" : "À choisir"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setSelection({})}>
            <RotateCcw /> Réinitialiser
          </Button>
        </aside>

        <section className="min-w-0">
          <SectionHeading
            title={activeLabel}
            subtitle={`${options.length} option${options.length > 1 ? "s" : ""} disponible${options.length > 1 ? "s" : ""}`}
            action={
              selection[activeStep] ? (
                <Button variant="ghost" size="sm" onClick={() => clearStep(activeStep)}>
                  Retirer
                </Button>
              ) : undefined
            }
          />

          <div className="mt-6 grid gap-3">
            {options.length === 0 && (
              <p className="rounded-xl border border-border bg-surface/50 p-6 text-sm text-muted-foreground">
                Pièces disponibles sur demande — contactez le magasin au {site.phoneLocal}.
              </p>
            )}
            {options.map((option) => {
              const selected = selection[activeStep]?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pick(option)}
                  className={cn(
                    "grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-brand-blue bg-surface-2 shadow-card"
                      : "border-border bg-surface/50 hover:border-border-strong",
                  )}
                >
                  <img
                    src={option.image}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 rounded-lg border border-border object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {option.brand}
                    </span>
                    <span className="block truncate text-sm font-semibold">{option.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.spec}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-sm font-bold">
                      {option.price === 0 ? "Inclus" : formatPrice(option.price)}
                    </span>
                    {selected && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand-blue">
                        <Check className="h-3 w-3" /> Choisi
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-xl border border-border bg-surface/60 p-5">
            <h2 className="font-display text-lg font-bold">Votre configuration</h2>

            <ul className="mt-4 grid gap-2 text-sm">
              {builderSteps.map((step) => {
                const chosen = selection[step.id];
                if (!chosen) return null;
                return (
                  <li key={step.id} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">{step.label}</span>
                      <span className="block truncate">{chosen.name}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold">
                      {chosen.price === 0 ? "—" : formatPrice(chosen.price)}
                    </span>
                  </li>
                );
              })}
              {Object.keys(selection).length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Aucun composant sélectionné pour l'instant.
                </li>
              )}
            </ul>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4 text-brand-purple" /> Consommation estimée
                </span>
                <span className="font-semibold">{watts} W</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            <Button variant="hero" size="lg" className="mt-5 w-full" onClick={addConfigToCart}>
              <ShoppingCart /> Ajouter la config au panier
            </Button>
            <Button variant="outline" className="mt-2 w-full" asChild>
              <a href={site.phoneHref}>Faire valider par un technicien</a>
            </Button>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface/60 p-5">
            <h3 className="text-sm font-semibold">
              Compatibilité{" "}
              {warnings.length > 0 && (
                <span className="ml-1 text-xs font-normal text-destructive">
                  {warnings.length} point{warnings.length > 1 ? "s" : ""} à vérifier
                </span>
              )}
            </h3>
            <ul className="mt-4 grid gap-3">
              {checks.map((check) => (
                <li key={check.label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0">
                    {check.state === "ok" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : check.state === "warn" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium">{check.label}</span>
                    <span className="block text-xs text-muted-foreground">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
              Aide à la compatibilité indicative : elle ne remplace pas la validation finale par nos
              techniciens.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
