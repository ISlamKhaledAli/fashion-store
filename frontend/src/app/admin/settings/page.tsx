import React from "react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminPlaceholderPage() {
  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 capitalize">
        settings
      </h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
        <p className="font-medium text-zinc-500">Coming Soon</p>
        <p className="mt-2 text-sm text-zinc-400">
          This management module is currently under construction.
        </p>
      </div>
    </div>
  );
}
