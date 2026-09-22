import React from "react";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-outline-variant/30" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <span className="font-serif text-xs tracking-widest text-on-surface-variant uppercase">
          The Curator
        </span>
      </div>
    </div>
  );
}
