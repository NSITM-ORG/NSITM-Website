/**
 * Skeleton — shimmer-animated loading placeholder (the `.skeleton-shimmer`
 * class is defined in index.css from Batch F1). Composable primitives so
 * pages build shapes matching their actual layout instead of a generic
 * spinner — per the "loading skeletons, shimmer" spec.
 */

export function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-sm ${className}`} />;
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-md border border-border bg-surface-elevated p-5">
      <Skeleton className="mb-3 h-32 w-full rounded-md" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default Skeleton;