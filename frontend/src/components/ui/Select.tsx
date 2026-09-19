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
  placeholder?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  className,
  labelPrefix,
  error,
  placeholder,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: placeholder || "Select...",
    value: "",
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block space-y-1", className)}
    >
      <Button
        variant="none"
        size="none"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 text-xs font-bold tracking-widest text-on-surface uppercase transition-all outline-none",
          error
            ? "border-error bg-error/5"
            : "border-outline-variant/30 bg-surface-container-lowest",
          isOpen && "border-primary"
        )}
        aria-label={
          labelPrefix
            ? `${labelPrefix} ${selectedOption.label}`
            : selectedOption.label
        }
        aria-expanded={isOpen}
      >
        <span className="mr-1 font-medium tracking-normal text-on-surface-variant normal-case">
          {labelPrefix}
        </span>
        {selectedOption.label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown
            size={14}
            className="text-on-surface-variant transition-colors group-hover:text-primary"
          />
        </motion.div>
      </Button>

      {error && (
        <p className="text-[10px] font-medium tracking-wider text-error uppercase">
          {error}
        </p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-4 w-56 origin-top-right rounded-sm border border-outline-variant/30 bg-surface-container-lowest py-2 shadow-2xl backdrop-blur-xl"
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
                      "flex w-full cursor-pointer items-center justify-between px-6 py-3 text-left text-[10px] tracking-widest uppercase transition-all",
                      isActive
                        ? "bg-surface-container-low font-bold text-primary"
                        : "font-medium text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
                    )}
                  >
                    {option.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="h-1 w-1 rounded-full bg-primary"
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
