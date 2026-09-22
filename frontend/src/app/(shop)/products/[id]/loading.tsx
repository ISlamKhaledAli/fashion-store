import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-outline-variant">/</span>
        <Skeleton className="h-4 w-24" />
        <span className="text-outline-variant">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-3/4 w-full rounded-lg" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
          </div>
        </div>

        {/* Right Column: Product Details Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
          </div>

          <Skeleton className="h-px w-full" />

          {/* Color Selection Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Size Selection Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-14 rounded-md" />
              <Skeleton className="h-10 w-14 rounded-md" />
              <Skeleton className="h-10 w-14 rounded-md" />
              <Skeleton className="h-10 w-14 rounded-md" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          {/* Accordion / Info Skeletons */}
          <div className="space-y-4 pt-6">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
