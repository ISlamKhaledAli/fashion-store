import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "error" | "surface" | "archived";
  className?: string;
}

export const Badge = ({ children, variant = "primary", className }: BadgeProps) => {
  const variants = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-secondary text-on-secondary",
    outline: "border border-outline-variant text-on-surface-variant",
    error: "bg-error text-on-error",
    surface: "bg-surface-container-high text-on-surface",
    archived: "bg-archived text-on-archived hover:bg-archived-hover shadow-sm transition-all duration-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
