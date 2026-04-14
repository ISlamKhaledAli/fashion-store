"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useSearchStore } from "@/store/searchStore";

function NavigationHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toggleDrawer } = useCartStore();
  const { onClose: closeSearch } = useSearchStore();

  // 1. Telemetry for Back Button (popstate)
  useEffect(() => {
    const handlePopState = () => {
      console.log('Back button pressed, refreshing data...');
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  // 2. Global UI Cleanup on route change
  useEffect(() => {
    // Close overlays instantly on navigation
    // Using a micro-task or immediate call to ensure it doesn't block the next page render
    toggleDrawer(false);
    closeSearch();
  }, [pathname, searchParams, toggleDrawer, closeSearch]);

  return null;
}

export const NavigationObserver = () => {
  return (
    <Suspense fallback={null}>
      <NavigationHandler />
    </Suspense>
  );
};
