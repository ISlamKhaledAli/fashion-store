"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, placeholder, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="relative group">
          <textarea
            id={id}
            ref={ref}
            placeholder={placeholder}
            className={cn(
              "w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-3 px-4 focus:ring-0 focus:border-primary transition-all text-sm placeholder:text-outline-variant placeholder:font-light resize-none",
              error && "border-error",
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

Textarea.displayName = "Textarea";
