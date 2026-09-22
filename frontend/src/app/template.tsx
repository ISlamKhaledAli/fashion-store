"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Global Editorial Page Transition
 * Diagonal Corner Sweep with Soft Opacity Fade
 * Applied to storefront & public pages, bypassed on /admin dashboard routes for maximum productivity
 */
export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Bypass transition animation completely inside admin dashboard
  if (isAdminRoute) {
    return <div className="min-h-full w-full">{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{
        clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
        opacity: 0,
      }}
      animate={{
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        opacity: 1,
        transition: {
          clipPath: {
            duration: 0.55,
            ease: [0.65, 0, 0.35, 1],
          },
          opacity: {
            duration: 0.3,
            ease: "easeOut",
          },
        },
      }}
      className="min-h-full w-full"
    >
      {children}
    </motion.div>
  );
}
