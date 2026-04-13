"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "default" | "floating";
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = "default", id, placeholder, icon, ...props }, ref) => {
    if (variant === "floating") {
      return (
        <div className="w-full space-y-1">
          <div className="relative group">
            {icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant peer-focus:text-primary transition-colors pointer-events-none flex items-center justify-center">
                {React.isValidElement(icon) 
                  ? React.cloneElement(icon as React.ReactElement, { 
                      size: 18, 
                      strokeWidth: 1.5 
                    } as any)
                  : icon}
              </div>
            )}
            <input
              id={id}
              ref={ref}
              placeholder=" " // Required for peer-placeholder-shown to work
              className={cn(
                "w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md pt-6 pb-2 px-4 focus:ring-0 focus:border-primary transition-all text-sm peer",
                error && "border-error/50",
                icon && "pl-11",
                className
              )}
              {...props}
            />
            {label && (
              <label 
                htmlFor={id}
                className={cn(
                  "absolute left-4 top-6 text-outline transition-all duration-300 pointer-events-none origin-left",
                  "peer-placeholder-shown:text-base peer-placeholder-shown:top-6",
                  "peer-focus:top-6 peer-focus:text-xs peer-focus:-translate-y-4 peer-focus:text-primary",
                  // Always float if there's a value (not placeholder-shown)
                  "peer-[:not(:placeholder-shown)]:top-6 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-4",
                  error && "text-error/70"
                )}
              >
                {label}
              </label>
            )}
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-500 group-focus-within:w-full rounded-b-md" />
          </div>
          {error && (
            <p className="text-[10px] text-error font-medium uppercase tracking-wider pt-1">{error}</p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors pointer-events-none flex items-center justify-center">
              {React.isValidElement(icon) 
                ? React.cloneElement(icon as React.ReactElement, { 
                    size: 18, 
                    strokeWidth: 1.5 
                  } as any)
                : icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            placeholder={placeholder}
            className={cn(
              "w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-3 px-4 focus:ring-0 focus:border-primary transition-all text-sm placeholder:text-outline-variant placeholder:font-light",
              error && "border-error",
              icon && "pl-11",
              className
            )}
            {...props}
          />
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-focus-within:w-full rounded-b-md" />
        </div>
        {error && (
          <p className="text-[10px] text-error font-medium uppercase tracking-wider">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
