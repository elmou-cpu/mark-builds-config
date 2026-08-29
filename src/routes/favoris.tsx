import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/favoris")({
  head: () => ({
    meta: [
      { title: "Mes favoris — Mark Computer" },
      {
        name: "description",
        content:
          "Retrouvez le matériel informatique que vous avez ajouté à vos favoris chez Mark Computer.",
      },
      { property: "og:title", content: "Mes favoris — Mark Computer" },
      { property: "og:description", content: "Votre sélection de matériel enregistrée." },
      { property: "og:url", content: "/favoris" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/favoris" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlistItems } = useShop();

  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Favoris" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Mes favoris</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {wishlistItems.length} produit{wishlistItems.length > 1 ? "s" : ""} enregistré
        {wishlistItems.length > 1 ? "s" : ""} sur cet appareil.
      </p>

      <div className="mt-10">
        {wishlistItems.length === 0 ? (
          <EmptyState
            title="Aucun favori pour l'instant"
            description="Touchez le cœur sur un produit pour le retrouver ici."
            icon={<Heart className="h-6 w-6" />}
            action={
              <Button variant="hero" asChild>
                <Link to="/produits">Explorer le catalogue</Link>
              </Button>
            }
          />
        ) : (
          <ProductGrid products={wishlistItems} />
        )}
      </div>
    </div>
  );
}
