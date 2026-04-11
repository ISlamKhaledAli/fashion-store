"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
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

export const ProductGrid = ({ children, className, isLoading }: ProductGridProps) => {
  return (
    <div className={cn("relative min-h-[400px]", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLoading ? "loading" : "results"}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
