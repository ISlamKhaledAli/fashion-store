import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-36" />
          <Skeleton className="mx-auto h-4 w-52" />
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <Skeleton className="h-11 w-full rounded-md pt-2" />
        </div>

        <div className="pt-2 text-center">
          <Skeleton className="mx-auto h-4 w-44" />
        </div>
      </div>
    </div>
  );
}
