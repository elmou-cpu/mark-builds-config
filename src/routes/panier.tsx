import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Info, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";
import { CartItemRow } from "@/components/cart/CartDrawer";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/store/shop";
import { site } from "@/data/site";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier & demande de commande — Mark Computer" },
      {
        name: "description",
        content:
          "Vérifiez votre sélection de matériel et envoyez votre demande de commande à Mark Computer Blida : retrait en magasin ou livraison.",
      },
      { property: "og:title", content: "Panier — Mark Computer" },
      {
        property: "og:description",
        content: "Finalisez votre demande de commande : retrait en magasin ou livraison.",
      },
      { property: "og:url", content: "/panier" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/panier" }],
  }),
  component: CartPage,
});

const DELIVERY_FEE = 1200;

function CartPage() {
  const { cartItems, cartTotal, clearCart } = useShop();
  const [mode, setMode] = useState("retrait");
  const [step, setStep] = useState<"panier" | "coordonnees" | "confirme">("panier");
  const [reference, setReference] = useState("");

  const shipping = mode === "livraison" ? DELIVERY_FEE : 0;
  const total = cartTotal + shipping;

  if (step === "confirme") {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface/50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-5 text-2xl font-bold">Demande enregistrée</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Référence <span className="font-semibold text-foreground">{reference}</span>. Un
            conseiller vous rappelle au {site.phoneLocal} pour confirmer disponibilité et paiement.
          </p>
          <p className="mt-4 rounded-lg border border-border bg-surface-2/60 p-3 text-xs text-muted-foreground">
            Simulation de commande : aucun paiement n'a été effectué et aucune donnée n'est transmise.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="hero" asChild>
              <Link to="/produits">Continuer mes achats</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Panier" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Votre panier</h1>

      {cartItems.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Votre panier est vide"
            description="Ajoutez du matériel depuis le catalogue ou le configurateur."
            icon={<ShoppingBag className="h-6 w-6" />}
            action={
              <Button variant="hero" asChild>
                <Link to="/produits">Parcourir le catalogue</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {step === "panier" ? (
              <>
                <ul className="rounded-xl border border-border bg-surface/40 px-5">
                  {cartItems.map(({ product, quantity }) => (
                    <CartItemRow key={product.id} product={product} quantity={quantity} />
                  ))}
                </ul>
                <Button variant="ghost" className="mt-3" onClick={clearCart}>
                  Vider le panier
                </Button>
              </>
            ) : (
              <form
                className="rounded-xl border border-border bg-surface/40 p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setReference(`MC-${Math.floor(100000 + Math.random() * 899999)}`);
                  clearCart();
                  setStep("confirme");
                }}
              >
                <h2 className="font-display text-lg font-bold">Vos coordonnées</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullname">Nom complet</Label>
                    <Input id="fullname" required placeholder="Votre nom" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tel">Téléphone</Label>
                    <Input id="tel" required placeholder="0X XX XX XX XX" />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="wilaya">Wilaya</Label>
                    <Input id="wilaya" required placeholder="Blida" />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="notes">Note (optionnel)</Label>
                    <Textarea id="notes" rows={4} placeholder="Précisions sur votre commande…" />
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-sm">Mode de retrait</Label>
                  <RadioGroup value={mode} onValueChange={setMode} className="mt-3 grid gap-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="retrait" id="retrait" className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">Retrait au magasin — gratuit</span>
                        <span className="block text-xs text-muted-foreground">{site.address}</span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="livraison" id="livraison" className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">
                          Livraison — {formatPrice(DELIVERY_FEE)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Vers les {site.wilayas} wilayas, paiement à la réception.
                        </span>
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="hero" size="lg" type="submit">
                    Confirmer la demande
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setStep("panier")}>
                    Retour au panier
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-xl border border-border bg-surface/60 p-6">
              <h2 className="font-display text-lg font-bold">Récapitulatif</h2>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sous-total</dt>
                  <dd>{formatPrice(cartTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd>{shipping === 0 ? "Retrait gratuit" : formatPrice(shipping)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
              </div>

              {step === "panier" && (
                <Button variant="hero" size="lg" className="mt-5 w-full" onClick={() => setStep("coordonnees")}>
                  Passer à la commande
                </Button>
              )}

              <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Paiement en magasin ou à la livraison. Ce site est une démonstration : aucun paiement
                en ligne n'est traité.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
