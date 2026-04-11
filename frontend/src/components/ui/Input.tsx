"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              "w-full bg-transparent border-none border-b border-outline-variant/30 py-3 px-0 focus:ring-0 focus:border-primary transition-all text-sm placeholder:text-outline-variant placeholder:font-light",
              error && "border-error",
              className
            )}
            {...props}
          />
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-focus-within:w-full" />
        </div>
        {error && (
          <p className="text-[10px] text-error font-medium uppercase tracking-wider">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
