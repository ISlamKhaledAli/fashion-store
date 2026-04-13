"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center justify-center cursor-pointer group">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center",
            checked 
              ? "bg-zinc-900 border-zinc-900 shadow-md scale-105" 
              : "bg-white border-zinc-200 hover:border-zinc-400"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
