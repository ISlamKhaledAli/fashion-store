"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "icon" | "surface" | "none";
  size?: "sm" | "md" | "lg" | "icon" | "none";
  isLoading?: boolean;
  isActive?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: "start" | "end";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    isLoading, 
    isActive, 
    icon,
    iconPlacement = "start",
    children, 
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-primary text-on-primary hover:bg-primary/90 uppercase tracking-[0.2em] font-bold text-[10px] shadow-lg shadow-primary/10",
      secondary: "bg-surface-container-low text-on-surface hover:bg-surface-container uppercase tracking-[0.1em] font-bold text-[10px]",
      outline: "border border-outline-variant hover:border-primary bg-transparent text-on-surface uppercase tracking-[0.1em] font-bold text-[10px]",
      ghost: "hover:bg-surface-container-low text-on-surface-variant transition-colors",
      surface: "bg-white text-black hover:bg-stone-100 uppercase tracking-[0.2em] font-bold text-[10px] shadow-xl",
      none: "",
      icon: cn(
        "transition-all duration-300 flex items-center justify-center rounded-full",
        isActive 
          ? "text-primary opacity-100 scale-110 bg-surface-container-low" 
          : "text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest"
      ),
    };

    const sizes = {
      sm: "px-4 py-2",
      md: "px-8 py-4",
      lg: "px-12 py-5",
      icon: "w-10 h-10 p-0",
      none: "p-0",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "inline-flex items-center justify-center cinematic-ease transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer relative",
          // Add gap only if both items exist and we're not only showing a spinner
          !isLoading && icon && children && "gap-3",
          variants[variant],
          size !== "none" && sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        <span className={cn(
          "flex w-full items-center justify-center gap-3 transition-opacity duration-300",
          isLoading && "opacity-0"
        )}>
          {icon && iconPlacement === "start" && (
            <span className="flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPlacement === "end" && (
            <span className="flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
        </span>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
