import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const unique = images.filter((src, i) => images.indexOf(src) === i);
  const current = unique[active] ?? unique[0];

  return (
    <div className="grid gap-3">
      <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface">
        <img
          src={current}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.15]"
        />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_70%_0%,color-mix(in_oklab,var(--brand-blue)_18%,transparent),transparent_60%)]" />
      </div>

      {unique.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {unique.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Image ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors",
                i === active ? "border-brand-blue" : "border-border hover:border-border-strong",
              )}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
