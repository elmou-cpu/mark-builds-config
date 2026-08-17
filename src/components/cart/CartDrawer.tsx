import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/store/shop";
import type { Product } from "@/data/types";

export function CartItemRow({
  product,
  quantity,
}: {
  product: Product;
  quantity: number;
}) {
  const { setQuantity, removeFromCart } = useShop();
  return (
    <li className="flex gap-3 border-b border-border py-4">
      <Link
        to="/produits/$slug"
        params={{ slug: product.slug }}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface"
      >
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {product.brand}
        </p>
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="mt-1 font-display text-sm font-bold">{formatPrice(product.price)}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              className="grid h-7 w-7 place-items-center"
              onClick={() => setQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold">{quantity}</span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              className="grid h-7 w-7 place-items-center"
              onClick={() => setQuantity(product.id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Retirer du panier"
            onClick={() => removeFromCart(product.id)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold">{formatPrice(product.price * quantity)}</p>
    </li>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, cartTotal } = useShop();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetTitle className="font-display">Votre panier</SheetTitle>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 items-center">
            <EmptyState
              title="Votre panier est vide."
              description="Parcourez le catalogue pour ajouter du matériel."
              icon={<ShoppingBag className="h-6 w-6" />}
              action={
                <Button variant="hero" asChild onClick={() => setCartOpen(false)}>
                  <Link to="/produits">Voir les produits</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <ul className="-mr-2 flex-1 overflow-y-auto pr-2">
              {cartItems.map(({ product, quantity }) => (
                <CartItemRow key={product.id} product={product} quantity={quantity} />
              ))}
            </ul>
            <div className="border-t border-border pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Démonstration : aucun paiement en ligne. Votre demande est transmise au magasin.
              </p>
              <div className="mt-4 grid gap-2">
                <Button variant="hero" size="lg" asChild onClick={() => setCartOpen(false)}>
                  <Link to="/panier">Passer commande</Link>
                </Button>
                <Button variant="outline" onClick={() => setCartOpen(false)}>
                  Continuer mes achats
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
