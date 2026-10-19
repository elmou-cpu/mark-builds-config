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
      <img src="/logo-mark.png" alt="Mark Computer" className="h-10 w-10 shrink-0 object-contain" />
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
