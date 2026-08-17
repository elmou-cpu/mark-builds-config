import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Heart, Phone, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DiscountBadge, ProductBadge, StatusBadge } from "@/components/product/ProductBadge";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { formatPrice, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/shop";
import type { Product } from "@/data/types";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useShop();
  const [quickView, setQuickView] = useState(false);
  const wished = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.oldPrice);
  const buyable = product.status === "disponible" || product.status === "sur-commande";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface/60 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        <Link to="/produits/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && <ProductBadge label={product.badge} />}
          {discount !== null && <DiscountBadge percent={discount} />}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            aria-label={wished ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            onClick={() => {
              toggleWishlist(product.id);
              toast.success(wished ? "Retiré de vos souhaits" : "Ajouté à vos souhaits");
            }}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:border-border-strong"
          >
            <Heart
              className={cn("h-4 w-4", wished ? "fill-destructive text-destructive" : "text-foreground")}
            />
          </button>
          <button
            type="button"
            aria-label="Aperçu rapide"
            onClick={() => setQuickView(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/80 opacity-0 backdrop-blur transition-all hover:border-border-strong focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">
          <Link to="/produits/$slug" params={{ slug: product.slug }} className="hover:text-brand-blue">
            {product.name}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="mt-3">
          <StatusBadge status={product.status} compact />
        </div>

        <div className="mt-4 pt-1">
          {buyable ? (
            <Button
              variant="subtle"
              className="w-full"
              onClick={() => {
                addToCart(product.id);
                setCartOpen(true);
              }}
            >
              <ShoppingCart /> Ajouter au panier
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/produits/$slug" params={{ slug: product.slug }}>
                <Phone /> Nous contacter
              </Link>
            </Button>
          )}
        </div>
      </div>

      <QuickViewDialog product={product} open={quickView} onOpenChange={setQuickView} />
    </article>
  );
}
