"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const FormSkeleton = () => (
  <div className="animate-in fade-in space-y-16 duration-500">
    <div className="space-y-8">
      <Skeleton className="mx-auto h-4 w-1/3" />
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
    <div className="space-y-8">
      <Skeleton className="mx-auto h-4 w-1/3" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);
