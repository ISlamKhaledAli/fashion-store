"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  viewMode?: "grid" | "list";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06, // 60ms stagger as requested
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const ProductGrid = ({ children, className, isLoading, viewMode = "grid" }: ProductGridProps) => {
  return (
    <div className={cn("relative min-h-[400px]", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode === "grid" ? (isLoading ? "grid-loading" : "grid-results") : (isLoading ? "list-loading" : "list-results")}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8" 
              : "flex flex-col gap-16 max-w-5xl mx-auto"
          )}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
