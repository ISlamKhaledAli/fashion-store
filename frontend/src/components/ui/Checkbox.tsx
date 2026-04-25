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
      <div className="relative flex items-center justify-center cursor-pointer group w-5 h-5">
        <input
          type="checkbox"
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            onCheckedChange?.(!checked);
          }}
          className={cn(
            "w-full h-full rounded-sm border transition-all duration-500 flex items-center justify-center",
            checked 
              ? "bg-black border-black shadow-[0_2px_10px_rgba(0,0,0,0.1)]" 
              : "bg-transparent border-stone-300 hover:border-black"
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
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
