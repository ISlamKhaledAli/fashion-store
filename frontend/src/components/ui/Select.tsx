"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
  labelPrefix?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "filter";
  uppercase?: boolean;
  icon?: React.ReactNode;
  id?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  className,
  label,
  required,
  labelPrefix,
  error,
  placeholder,
  disabled = false,
  variant = "default",
  uppercase,
  icon,
  id: externalId,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = externalId || generatedId;

  useClickOutside(containerRef, () => setIsOpen(false));

  const isFullWidth =
    className?.includes("w-full") ||
    (variant === "default" && !className?.includes("inline"));

  // Determine uppercase behavior: default false for forms, true for filter variant unless explicitly overridden
  const isUppercase = uppercase ?? variant === "filter";

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        isFullWidth ? "w-full space-y-2" : "inline-block space-y-1",
        className
      )}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold tracking-wider text-on-surface-variant uppercase"
        >
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}

      <div className={cn("group/select relative", isFullWidth && "w-full")}>
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "group flex cursor-pointer items-center transition-all outline-none",
            isFullWidth ? "w-full justify-between" : "inline-flex gap-2",
            variant === "filter"
              ? "rounded-md border px-4 py-3 text-xs font-bold tracking-widest uppercase"
              : "rounded-md border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface",
            isUppercase && "text-xs font-bold tracking-widest uppercase",
            error
              ? "border-error bg-error/5"
              : isOpen
                ? "border-primary ring-0"
                : "border-outline-variant/30 hover:border-outline-variant",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {icon && (
              <span className="text-on-surface-variant transition-colors group-hover:text-primary">
                {icon}
              </span>
            )}
            {labelPrefix && (
              <span className="font-medium tracking-normal text-on-surface-variant normal-case">
                {labelPrefix}
              </span>
            )}
            <span
              className={cn(
                "truncate",
                !selectedOption && "font-light text-outline-variant"
              )}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder || "Select..."}
            </span>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="ml-2 shrink-0"
          >
            <ChevronDown
              size={15}
              className={cn(
                "transition-colors",
                isOpen
                  ? "text-primary"
                  : "text-on-surface-variant group-hover:text-primary"
              )}
            />
          </motion.div>
        </button>

        {/* Animated Brand Primary Bottom Highlight Line (matches Input and Textarea) */}
        {variant === "default" && (
          <div
            className={cn(
              "absolute bottom-0 left-0 h-[2px] rounded-b-md bg-primary transition-all duration-500",
              isOpen ? "w-full" : "w-0 group-focus-within/select:w-full"
            )}
          />
        )}
      </div>

      {error && (
        <p className="text-[10px] font-medium tracking-wider text-error uppercase">
          {error}
        </p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-outline-variant/30 bg-surface-container-lowest py-1.5 shadow-2xl backdrop-blur-xl",
              isFullWidth
                ? "right-0 left-0 w-full min-w-full"
                : "right-0 w-56 min-w-[180px]"
            )}
            role="listbox"
          >
            <div className="flex flex-col">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-center text-xs text-outline-variant italic">
                  No options available
                </div>
              ) : (
                options.map((option) => {
                  const isActive = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-xs transition-colors",
                        isUppercase
                          ? "text-[10px] tracking-widest uppercase"
                          : "text-sm font-medium normal-case",
                        isActive
                          ? "bg-surface-container-low font-semibold text-primary"
                          : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </div>

                      {isActive && (
                        <Check
                          size={14}
                          className="ml-2 shrink-0 text-primary"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
