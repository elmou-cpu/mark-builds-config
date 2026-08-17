import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/types";

export function ProductGrid({
  products,
  view = "grid",
  className,
}: {
  products: Product[];
  view?: "grid" | "list";
  className?: string;
}) {
  return (
    <div
      className={cn(
        view === "grid"
          ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
          : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
