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
          <label
            className="text-xs font-bold tracking-widest text-on-surface-variant uppercase"
            htmlFor={id}
          >
            {label}
          </label>
        )}
        <div className="group/textarea relative">
          <textarea
            id={id}
            ref={ref}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none rounded-md border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm transition-all placeholder:font-light placeholder:text-outline-variant focus:border-primary focus:ring-0",
              error && "border-error",
              className
            )}
            {...props}
          />
          <div className="absolute bottom-0 left-0 h-[2px] w-0 rounded-b-md bg-primary transition-all duration-500 group-focus-within/textarea:w-full" />
        </div>
        {error && (
          <p className="text-[10px] font-medium tracking-wider text-error uppercase">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
