import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/data/types";

const statusMeta: Record<ProductStatus, { label: string; className: string; dot: string }> = {
  disponible: {
    label: "Disponible",
    className: "border-success/30 bg-success/10 text-success",
    dot: "bg-success",
  },
  rupture: {
    label: "Rupture",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  "sur-commande": {
    label: "Sur commande",
    className: "border-warning/30 bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  configuration: {
    label: "Configuration uniquement",
    className: "border-brand-blue/30 bg-brand-blue/10 text-brand-blue",
    dot: "bg-brand-blue",
  },
  "nous-contacter": {
    label: "Nous contacter",
    className: "border-border-strong bg-surface-2 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export const statusLabel = (status: ProductStatus) => statusMeta[status].label;

export function StatusBadge({
  status,
  className,
  compact = false,
}: {
  status: ProductStatus;
  className?: string;
  compact?: boolean;
}) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
        meta.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {compact && status === "configuration" ? "Configuration" : meta.label}
    </span>
  );
}

export function ProductBadge({ label, className }: { label: string; className?: string }) {
  const isUsed = /occasion|neuf|10\/10/i.test(label);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em]",
        isUsed
          ? "border border-warning/40 bg-warning/15 text-warning"
          : "gradient-brand text-primary-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center rounded-md bg-destructive px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-destructive-foreground">
      -{percent}%
    </span>
  );
}
