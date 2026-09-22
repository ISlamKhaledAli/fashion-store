import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Title & Controls Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar skeleton (hidden on mobile, visible on lg) */}
        <div className="hidden space-y-6 lg:block">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-6 w-20" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-30" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
