import React from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminPlaceholderPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold tracking-tight capitalize text-zinc-900">analytics</h1>
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 text-center">
        <p className="text-zinc-500 font-medium">Coming Soon</p>
        <p className="text-sm text-zinc-400 mt-2">This management module is currently under construction.</p>
      </div>
    </div>
  );
}
