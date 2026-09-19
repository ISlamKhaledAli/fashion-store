"use client";

import React from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloseButtonProps extends Omit<HTMLMotionProps<"button">, "onClick"> {
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

export const CloseButton = ({
  onClick,
  size = 20,
  className,
  ...props
}: CloseButtonProps) => {
  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      onClick={onClick}
      className={cn(
        "rounded-full p-2 transition-colors duration-300",
        "cursor-pointer bg-transparent hover:bg-zinc-100 active:bg-zinc-200",
        "text-zinc-500 hover:text-zinc-900",
        "focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:outline-none",
        className
      )}
      {...props}
    >
      <motion.div
        variants={{
          initial: { rotate: 0, scale: 1 },
          hover: { rotate: 90, scale: 1.1 },
          tap: { scale: 0.9 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex translate-z-0 items-center justify-center"
        style={{ z: 0 }}
      >
        <X size={size} />
      </motion.div>
    </motion.button>
  );
};
