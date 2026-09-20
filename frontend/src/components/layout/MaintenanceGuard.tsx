"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { contentApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Sparkles, Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StoreSettings {
  maintenanceMode?: boolean;
}

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<StoreSettings>("admin_settings")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setMaintenanceMode(Boolean(res.data.data.maintenanceMode));
        }
      })
      .catch(() => {
        // Fallback to local storage if offline
        try {
          const saved = localStorage.getItem("curator_admin_settings");
          if (saved && isMounted) {
            const parsed = JSON.parse(saved) as StoreSettings;
            setMaintenanceMode(Boolean(parsed.maintenanceMode));
          }
        } catch {}
      })
      .finally(() => {
        if (isMounted) setLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loaded) {
    return <>{children}</>;
  }

  // If maintenance mode is NOT active, render normally
  if (!maintenanceMode) {
    return <>{children}</>;
  }

  // If maintenance mode is active AND user is an ADMIN, allow viewing with high-visibility banner
  if (user?.role === "ADMIN") {
    return (
      <>
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-900 backdrop-blur-md dark:text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Atelier Maintenance Active:</strong> Storefront is
              currently obscured from public visitors. You are previewing as an
              Administrator.
            </span>
          </div>
          <Link
            href="/admin/settings"
            className="rounded bg-amber-600/20 px-2 py-0.5 text-[11px] font-bold text-amber-950 transition-colors hover:bg-amber-600/30 dark:text-white"
          >
            Manage in Settings &rarr;
          </Link>
        </div>
        {children}
      </>
    );
  }

  // Public / Customer viewing: Render luxury Haute-Couture Maintenance screen
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-20 text-center font-sans text-white selection:bg-white selection:text-zinc-950">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl space-y-8">
        {/* Brand Monogram */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl backdrop-blur-xl">
          <Lock className="h-6 w-6 text-zinc-400" />
        </div>

        {/* Identity */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-[0.3em] text-zinc-500 uppercase">
            Archival Atelier &bull; Haute Prêt-à-Porter
          </p>
          <h1 className="font-serif text-4xl font-light tracking-tight text-zinc-100 sm:text-5xl">
            The Atelier is in Private Curation
          </h1>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Our curators and artisans are currently harmonizing upcoming
            seasonal archival drops and inventory reconciliations. Public
            viewing will resume shortly.
          </p>
        </div>

        {/* Concierge Status Box */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-left backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>VIP Client Concierge</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            For urgent sizing assistance, active rental dispatches, or private
            appointment requests, reach our desk directly:
          </p>
          <a
            href="mailto:concierge@thecurator.com"
            className="mt-3 inline-block font-mono text-xs text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            concierge@thecurator.com
          </a>
        </div>

        {/* Staff Authentication Link */}
        <div className="pt-4">
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-transparent text-xs text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
            >
              Staff &bull; Concierge Access{" "}
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
