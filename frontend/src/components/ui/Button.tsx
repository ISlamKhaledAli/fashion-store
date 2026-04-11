"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "surface";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-on-primary hover:bg-primary/90",
      secondary: "bg-secondary text-on-secondary hover:bg-secondary/90",
      outline: "border border-outline-variant hover:border-primary bg-transparent text-primary",
      ghost: "hover:bg-surface-container-low text-on-surface-variant",
      surface: "bg-surface-container-highest text-primary hover:bg-surface-dim",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-8 py-4 text-sm",
      lg: "px-12 py-5 text-base",
      icon: "p-2",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium tracking-tight cinematic-ease transition-all disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
