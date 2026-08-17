import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/data/types";
import { cn } from "@/lib/utils";

export function CategoryCard({
  category,
  className,
  size = "default",
}: {
  category: Category;
  className?: string;
  size?: "default" | "tall";
}) {
  return (
    <Link
      to="/produits"
      search={{ categorie: category.id }}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-border-strong hover:shadow-lift",
        size === "tall" ? "min-h-64" : "min-h-44",
        className,
      )}
    >
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-45 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative z-10 flex items-end gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold">{category.name}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">{category.label}</p>
        </div>
        <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background/70 transition-colors group-hover:border-brand-blue group-hover:text-brand-blue">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
