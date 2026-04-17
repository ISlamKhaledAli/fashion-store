"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloseButtonProps extends Omit<HTMLMotionProps<"button">, "onClick"> {
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

export const CloseButton = ({ onClick, size = 20, className, ...props }: CloseButtonProps) => {
  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      onClick={onClick}
      className={cn(
        "p-2 rounded-full transition-colors duration-300",
        "bg-transparent hover:bg-zinc-100 active:bg-zinc-200 cursor-pointer",
        "text-zinc-500 hover:text-zinc-900",
        "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
        className
      )}
      {...props}
    >
      <motion.div
        variants={{
          initial: { rotate: 0, scale: 1 },
          hover: { rotate: 90, scale: 1.1 },
          tap: { scale: 0.9 }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center justify-center translate-z-0"
        style={{ z: 0 }}
      >
        <X size={size} />
      </motion.div>
    </motion.button>
  );
};
