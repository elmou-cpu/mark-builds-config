import { Star } from "lucide-react";
import type { Review } from "@/data/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-border bg-surface/60 p-5">
      <div className="flex items-center gap-1" aria-label={`${review.rating} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < review.rating ? "h-3.5 w-3.5 fill-warning text-warning" : "h-3.5 w-3.5 text-muted"
            }
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
        « {review.excerpt} »
      </blockquote>
      <figcaption className="mt-4 text-xs text-muted-foreground">
        {review.author} · {review.source}
      </figcaption>
    </figure>
  );
}
