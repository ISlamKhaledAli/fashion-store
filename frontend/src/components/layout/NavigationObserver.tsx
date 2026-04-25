"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useSearchStore } from "@/store/searchStore";

function NavigationHandler() {
  const pathname = usePathname();

  // Close overlays on route change — only if actually open
  useEffect(() => {
    const { isOpen: cartOpen } = useCartStore.getState();
    const { isOpen: searchOpen } = useSearchStore.getState();

    if (cartOpen) useCartStore.getState().toggleDrawer(false);
    if (searchOpen) useSearchStore.getState().onClose();
  }, [pathname]); // pathname only, no other deps

  return null;
}

export const NavigationObserver = () => {
  return (
    <Suspense fallback={null}>
      <NavigationHandler />
    </Suspense>
  );
};
