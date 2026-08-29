export function ProductSpecs({ specifications }: { specifications: Record<string, string> }) {
  const entries = Object.entries(specifications);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Fiche technique détaillée disponible sur demande auprès du magasin.
      </p>
    );
  }
  return (
    <dl className="grid gap-x-10 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-baseline justify-between gap-6 border-b border-border py-3"
        >
          <dt className="text-sm text-muted-foreground">{key}</dt>
          <dd className="text-right text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
