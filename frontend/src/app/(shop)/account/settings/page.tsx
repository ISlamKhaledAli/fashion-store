import React from "react";

export default function AccountPlaceholderPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <h1 className="text-3xl font-medium tracking-tight capitalize">
        settings
      </h1>
      <div className="rounded-sm border border-outline-variant/10 bg-surface-container-low p-12 text-center">
        <p className="font-medium text-on-surface-variant">Coming Soon</p>
        <p className="mt-2 text-sm text-on-surface-variant/60">
          We are actively developing this feature.
        </p>
      </div>
    </div>
  );
}
