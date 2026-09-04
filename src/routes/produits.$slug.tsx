import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Phone, Plus, ShieldCheck, ShoppingCart, Truck, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { DiscountBadge, ProductBadge, StatusBadge } from "@/components/product/ProductBadge";
import { ReviewCard } from "@/components/common/ReviewCard";
import { discountPercent, formatPrice } from "@/lib/format";
import { bySlugOf, catalogQueryOptions, useProducts } from "@/lib/catalog-query";
import { categoryMap } from "@/data/categories";
import { reviews } from "@/data/reviews";
import { site } from "@/data/site";
import { useShop } from "@/store/shop";

export const Route = createFileRoute("/produits/$slug")({
  loader: async ({ params, context }) => {
    const catalog = await context.queryClient.ensureQueryData(catalogQueryOptions);
    const product = bySlugOf(catalog.products, params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produit indisponible — Mark Computer" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const description = product.description.slice(0, 155);
    return {
      meta: [
        { title: `${product.brand} ${product.name} — Mark Computer` },
        { name: "description", content: description },
        { property: "og:title", content: `${product.brand} ${product.name}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/produits/${product.slug}` },
      ],
      links: [{ rel: "canonical", href: `/produits/${product.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useProducts();
  const loaded = Route.useLoaderData();
  const product = bySlugOf(products, slug) ?? loaded.product;
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useShop();
  const [quantity, setQuantity] = useState(1);
  const wished = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.oldPrice);
  const buyable = product.status === "disponible" || product.status === "sur-commande";
  const category = categoryMap[product.category];
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { label: "Produits", to: "/produits" },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={`${product.brand} ${product.name}`} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && <ProductBadge label={product.badge} />}
            {discount !== null && <DiscountBadge percent={discount} />}
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {category?.name}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.brand} · Réf. {product.sku}
          </p>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={product.status} />
            <span className="text-xs text-muted-foreground">
              {product.condition === "neuf" ? "Produit neuf" : "Matériel d'occasion vérifié"}
            </span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <div className="flex w-fit items-center rounded-md border border-border">
              <button
                type="button"
                aria-label="Diminuer la quantité"
                className="grid h-11 w-11 place-items-center"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="Augmenter la quantité"
                className="grid h-11 w-11 place-items-center"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {buyable ? (
              <Button
                variant="hero"
                size="lg"
                onClick={() => {
                  addToCart(product.id, quantity);
                  setCartOpen(true);
                }}
              >
                <ShoppingCart /> Ajouter au panier
              </Button>
            ) : (
              <Button variant="hero" size="lg" asChild>
                <a href={site.phoneHref}>
                  <Phone /> Appeler pour disponibilité
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              aria-label="Ajouter aux favoris"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(wished ? "Retiré de vos souhaits" : "Ajouté à vos souhaits");
              }}
            >
              <Heart className={wished ? "fill-destructive text-destructive" : ""} />
              <span className="sm:hidden">Favoris</span>
            </Button>
          </div>

          <ul className="mt-8 grid gap-3 rounded-xl border border-border bg-surface/50 p-5 text-sm">
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-brand-blue" />
              Livraison dans les {site.wilayas} wilayas, retrait possible au magasin.
            </li>
            <li className="flex items-center gap-3">
              <Wrench className="h-4 w-4 shrink-0 text-brand-blue" />
              Montage et installation possibles en atelier.
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-blue" />
              Matériel d'origine, garantie constructeur.
            </li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="specs" className="mt-16">
        <TabsList>
          <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
          <TabsTrigger value="livraison">Livraison & garantie</TabsTrigger>
          <TabsTrigger value="avis">Avis</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-6">
          <ProductSpecs specifications={product.specifications} />
        </TabsContent>
        <TabsContent value="livraison" className="mt-6">
          <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <p className="rounded-xl border border-border bg-surface/50 p-5">
              Expédition vers l'ensemble des {site.wilayas} wilayas via nos partenaires de livraison.
              Retrait immédiat possible au magasin : {site.address}.
            </p>
            <p className="rounded-xl border border-border bg-surface/50 p-5">
              Garantie constructeur sur le matériel neuf. Pour le matériel d'occasion, la durée de
              garantie est précisée en magasin avant l'achat.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="avis" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            eyebrow="À découvrir"
            title="Produits similaires"
            action={
              <Button variant="subtle" asChild>
                <Link to="/produits" search={{ categorie: product.category }}>
                  Voir la catégorie
                </Link>
              </Button>
            }
          />
          <ProductGrid products={related} className="mt-8" />
        </section>
      )}
    </div>
  );
}
