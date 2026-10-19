import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Info, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

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
import { placeOrder } from "@/lib/orders.functions";
import { getPublicStoreSettings } from "@/lib/settings.functions";
import { toSafeMessage } from "@/lib/errors";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier & commande — Mark Computer" },
      {
        name: "description",
        content:
          "Vérifiez votre sélection de matériel et envoyez votre commande à Mark Computer Blida : retrait en magasin ou livraison, paiement sur place.",
      },
      { property: "og:title", content: "Panier — Mark Computer" },
      {
        property: "og:description",
        content: "Finalisez votre commande : retrait en magasin ou livraison.",
      },
      { property: "og:url", content: "/panier" },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/panier" }],
  }),
  component: CartPage,
});

interface Confirmation {
  orderNumber: string;
  total: number;
  shippingFee: number;
}

function CartPage() {
  const { cartItems, cartTotal, clearCart } = useShop();
  const submitOrder = useServerFn(placeOrder);
  const fetchSettings = useServerFn(getPublicStoreSettings);

  const settingsQuery = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => fetchSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const [mode, setMode] = useState("retrait");
  const [step, setStep] = useState<"panier" | "coordonnees">("panier");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    wilaya: "",
    address: "",
    notes: "",
  });

  const deliveryFee = settingsQuery.data?.deliveryFee ?? 1200;
  const freeThreshold = settingsQuery.data?.freeDeliveryThreshold ?? null;
  const shipping =
    mode === "livraison" && !(freeThreshold !== null && cartTotal >= freeThreshold)
      ? deliveryFee
      : 0;
  const total = cartTotal + shipping;
  const invalidStock = cartItems.some(({ product, quantity }) => product.status !== "disponible" || product.stock < quantity || quantity < 1);

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          items: cartItems.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
          customer: {
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            wilaya: form.wilaya,
            address: form.address,
            notes: form.notes,
            deliveryMode: mode === "livraison" ? "livraison" : "retrait",
          },
        },
      });
      clearCart();
      setConfirmation({
        orderNumber: result.orderNumber,
        total: result.total,
        shippingFee: result.shippingFee,
      });
    } catch (error) {
      toast.error("Commande non enregistrée", {
        description: toSafeMessage(error, "Veuillez vérifier votre panier et réessayer."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface/50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-5 text-2xl font-bold">Commande enregistrée</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Numéro de commande{" "}
            <span className="font-semibold text-foreground">{confirmation.orderNumber}</span> — total{" "}
            <span className="font-semibold text-foreground">{formatPrice(confirmation.total)}</span>.
            Votre demande est transmise au magasin pour confirmation.
          </p>
          <p className="mt-4 rounded-lg border border-border bg-surface-2/60 p-3 text-xs text-muted-foreground">
            Le paiement se fait en magasin au retrait, ou à la réception en cas de livraison. Aucun
            paiement en ligne n'est demandé.
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
      <Breadcrumbs items={[{ label: "Panier" }]} />
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
              <form className="rounded-xl border border-border bg-surface/40 p-6" onSubmit={submit}>
                <h2 className="font-display text-lg font-bold">Vos coordonnées</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullname">Nom complet</Label>
                    <Input
                      id="fullname"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Votre nom"
                      value={form.fullName}
                      onChange={update("fullName")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tel">Téléphone</Label>
                    <Input
                      id="tel"
                      required
                      minLength={6}
                      maxLength={30}
                      placeholder="0X XX XX XX XX"
                      value={form.phone}
                      onChange={update("phone")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (optionnel)</Label>
                    <Input
                      id="email"
                      type="email"
                      maxLength={200}
                      placeholder="vous@exemple.com"
                      value={form.email}
                      onChange={update("email")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wilaya">Wilaya</Label>
                    <Input
                      id="wilaya"
                      required
                      minLength={2}
                      maxLength={60}
                      placeholder="Blida"
                      value={form.wilaya}
                      onChange={update("wilaya")}
                    />
                  </div>
                  {mode === "livraison" && (
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="address">Adresse de livraison</Label>
                      <Input
                        id="address"
                        required
                        minLength={5}
                        maxLength={300}
                        placeholder="Rue, quartier, ville"
                        value={form.address}
                        onChange={update("address")}
                      />
                    </div>
                  )}
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="notes">Note (optionnel)</Label>
                    <Textarea
                      id="notes"
                      rows={4}
                      maxLength={1000}
                      placeholder="Précisions sur votre commande…"
                      value={form.notes}
                      onChange={update("notes")}
                    />
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
                          Livraison — {formatPrice(deliveryFee)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Vers les {site.wilayas} wilayas, paiement à la réception.
                        </span>
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="hero" size="lg" type="submit" disabled={submitting || invalidStock}>
                    {submitting && <Loader2 className="animate-spin" />} Confirmer la commande
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
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-5 w-full"
                  disabled={invalidStock}
                  onClick={() => setStep("coordonnees")}
                >
                  Passer à la commande
                </Button>
              )}
              {invalidStock && <p role="alert" className="mt-4 text-sm text-destructive">Un produit est indisponible ou sa quantité dépasse le stock. Ajustez votre panier.</p>}

              <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Le montant est recalculé par nos serveurs à l'enregistrement de la commande. Paiement
                en magasin ou à la livraison.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
