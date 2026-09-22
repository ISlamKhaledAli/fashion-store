"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Editorial Diagonal Corner Sweep Page Transition
 * Origin: Top-Left (أعلى اليسار)
 * Timing: 0.70s with smooth S-curve cubic-bezier ease
 * Effect: Unfolds diagonally from top-left across to bottom-right, smoothly sweeping over the viewport.
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
        opacity: 1,
      }}
      animate={{
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        opacity: 1,
        transition: {
          duration: 0.7,
          ease: [0.35, 0.1, 0.25, 1],
        },
        transitionEnd: {
          clipPath: "none",
        },
      }}
      className="min-h-full w-full"
      style={{
        willChange: "clip-path",
      }}
    >
      {children}
    </motion.div>
  );
}
