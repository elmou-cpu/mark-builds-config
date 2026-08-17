import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * BRAND ASSET SLOT.
 * The official Mark Computer logo file was not supplied with this build.
 * To use it: drop the file in src/assets/logo.png, import it here and render
 * <img src={logo} .../> instead of the wordmark below. Nothing else changes.
 */
export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      aria-label="Mark Computer — accueil"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg gradient-brand">
        <span className="font-display text-[0.95rem] font-bold leading-none text-primary-foreground">
          M
        </span>
        <span className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.5),transparent_60%)]" />
      </span>
      {!compact && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-[1.02rem] font-bold tracking-tight">
            MARK<span className="text-gradient-brand"> COMPUTER</span>
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Blida · Informatique
          </span>
        </span>
      )}
    </Link>
  );
}
