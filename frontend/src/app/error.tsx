"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client runtime errors
    console.error("[The Curator Error Boundary]:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Background Ambient Aura */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-error/10 blur-3xl" />

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-error/20 bg-error/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-error uppercase">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Encountered An Anomaly</span>
      </div>

      {/* Main Title */}
      <h1 className="mb-4 text-3xl font-extralight tracking-tight text-on-surface sm:text-5xl md:text-6xl">
        Interrupted Experience
      </h1>

      <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-on-surface-variant">
        We encountered an unexpected disruption while rendering this atelier
        view. Our team has been notified.
      </p>

      {error.digest && (
        <p className="mb-8 font-mono text-xs text-outline">
          Reference Digest: {error.digest}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={() => reset()}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 text-xs font-semibold tracking-widest text-on-primary uppercase shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload View</span>
        </button>

        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-8 text-xs font-semibold tracking-widest text-on-surface uppercase transition-all hover:border-outline hover:bg-surface-container-low"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Storefront</span>
        </Link>
      </div>
    </div>
  );
}
