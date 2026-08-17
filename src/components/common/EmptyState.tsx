import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface/50 px-6 py-16 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground">
        {icon ?? <PackageOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Une erreur est survenue."
      description="Veuillez réessayer."
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Réessayer
          </button>
        ) : undefined
      }
    />
  );
}
