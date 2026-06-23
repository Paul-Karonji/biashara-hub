/**
 * Skeleton loaders for the product grid.
 * Shown while product data is fetching to prevent layout shift and
 * communicate to users that content is on its way.
 */

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-border animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square w-full bg-surface" />
      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-surface rounded-full w-3/4" />
        <div className="h-3 bg-surface rounded-full w-1/2" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-4 bg-surface rounded-full w-1/3" />
          <div className="h-3 bg-surface rounded-full w-1/4" />
        </div>
        <div className="h-10 bg-surface rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
