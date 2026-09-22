"use client";

import React, { useEffect, useRef } from "react";
import { CloseButton } from "./CloseButton";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
  bodyClassName?: string;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className,
  bodyClassName,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && onClose) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "pointer-events-auto flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface text-on-surface shadow-2xl",
              maxWidthMap[maxWidth],
              className
            )}
          >
            {(title || onClose) && (
              <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-6 py-4">
                <div>
                  {title && (
                    <h3 className="text-lg font-bold tracking-tight text-on-surface">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
                      {description}
                    </p>
                  )}
                </div>
                {onClose && (
                  <CloseButton
                    onClick={onClose}
                    className="cursor-pointer p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    size={18}
                  />
                )}
              </div>
            )}
            <div
              className={cn("flex-1 overflow-y-auto p-5 sm:p-6", bodyClassName)}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
