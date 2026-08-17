import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        align === "center"
          ? "justify-items-center text-center"
          : "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-brand-blue">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold sm:text-3xl lg:text-[2.1rem]">{title}</h2>
        {subtitle && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
