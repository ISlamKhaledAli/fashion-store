"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, checked, onCheckedChange, label, id: externalId, ...props },
    ref
  ) => {
    const autoId = useId();
    const inputId = externalId || autoId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group relative flex cursor-pointer items-center gap-3",
          className
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-all duration-500",
            checked
              ? "border-black bg-black shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
              : "border-stone-300 bg-transparent group-hover:border-black"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
