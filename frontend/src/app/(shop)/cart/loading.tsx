import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-8 w-44" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Cart items list skeleton */}
        <div className="space-y-6 lg:col-span-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-lg border border-outline-variant/20 p-4"
            >
              <Skeleton className="h-28 w-24 rounded-md" />
              <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary card skeleton */}
        <div className="lg:col-span-4">
          <div className="space-y-4 rounded-xl border border-outline-variant/20 bg-surface-container-low p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-md pt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
