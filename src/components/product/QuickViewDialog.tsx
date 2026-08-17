import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/product/ProductBadge";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/store/shop";
import type { Product } from "@/data/types";

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addToCart, setCartOpen } = useShop();
  const specs = Object.entries(product.specifications).slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-border bg-popover p-0">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden bg-background">
            <img
              src={product.image}
              alt={`${product.brand} ${product.name}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {product.brand}
            </p>
            <DialogTitle className="mt-2 text-xl font-bold">{product.name}</DialogTitle>
            <DialogDescription className="mt-2 line-clamp-3 text-sm">
              {product.description}
            </DialogDescription>

            <p className="mt-4 font-display text-2xl font-bold">{formatPrice(product.price)}</p>
            <div className="mt-3">
              <StatusBadge status={product.status} />
            </div>

            {specs.length > 0 && (
              <dl className="mt-5 space-y-1.5 text-xs">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-border py-1.5">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {(product.status === "disponible" || product.status === "sur-commande") && (
                <Button
                  variant="hero"
                  onClick={() => {
                    addToCart(product.id);
                    onOpenChange(false);
                    setCartOpen(true);
                  }}
                >
                  <ShoppingCart /> Ajouter au panier
                </Button>
              )}
              <Button variant="outline" asChild onClick={() => onOpenChange(false)}>
                <Link to="/produits/$slug" params={{ slug: product.slug }}>
                  Voir le produit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
