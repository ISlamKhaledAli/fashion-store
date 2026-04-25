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
  ({ className, checked, onCheckedChange, label, id: externalId, ...props }, ref) => {
    const autoId = useId();
    const inputId = externalId || autoId;

    return (
      <label htmlFor={inputId} className={cn("relative flex items-center gap-3 cursor-pointer group", className)}>
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
            "w-5 h-5 shrink-0 rounded-sm border transition-all duration-500 flex items-center justify-center",
            checked 
              ? "bg-black border-black shadow-[0_2px_10px_rgba(0,0,0,0.1)]" 
              : "bg-transparent border-stone-300 group-hover:border-black"
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
                  damping: 30 
                }}
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
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
