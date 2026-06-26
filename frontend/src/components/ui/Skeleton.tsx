interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-borde/20 bg-tarjeta p-5">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="mb-2 h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
