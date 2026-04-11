"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface ProductSkeletonProps {
  className?: string;
}

export const ProductSkeleton = ({ className }: ProductSkeletonProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <Skeleton className="aspect-3/4 rounded-sm" />
      <div className="space-y-4">
        <Skeleton className="h-2 w-24 rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-2 w-28 rounded-full" />
      </div>
    </div>
  );
};

