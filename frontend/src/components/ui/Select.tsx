"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Button } from "./Button";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  labelPrefix?: string;
  error?: string;
}

export const Select = ({ options, value, onChange, className, labelPrefix, error }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value) || options[0] || { label: "Select...", value: "" };

  return (
    <div ref={containerRef} className={cn("relative inline-block space-y-1", className)}>
      <Button
        variant="none"
        size="none"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface font-bold cursor-pointer outline-none group border rounded-md px-4 py-3 transition-all",
          error ? "border-error bg-error/5" : "border-outline-variant/30 bg-surface-container-lowest",
          isOpen && "border-primary"
        )}
        aria-label={labelPrefix ? `${labelPrefix} ${selectedOption.label}` : selectedOption.label}
        aria-expanded={isOpen}
      >
        <span className="text-on-surface-variant font-medium normal-case tracking-normal mr-1">
          {labelPrefix}
        </span>
        {selectedOption.label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
        </motion.div>
      </Button>

      {error && (
        <p className="text-[10px] text-error font-medium uppercase tracking-wider">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-4 w-56 bg-surface-container-lowest border border-outline-variant/30 shadow-2xl z-50 py-2 rounded-sm origin-top-right backdrop-blur-xl"
          >
            <div className="flex flex-col">
              {options.map((option) => {
                const isActive = option.value === value;
                return (
                  <Button
                    key={option.value}
                    variant="none"
                    size="none"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between px-6 py-3 text-[10px] uppercase tracking-widest text-left transition-all cursor-pointer w-full",
                      isActive 
                        ? "text-primary font-bold bg-surface-container-low" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest font-medium"
                    )}
                  >
                    {option.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
