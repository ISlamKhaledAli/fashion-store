"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Diagonal Corner Sweep + Soft Fade Page Transition
 * Fast editorial reveal (0.35s) from top-left corner with opacity blend
 */
export default function ShopTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
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
