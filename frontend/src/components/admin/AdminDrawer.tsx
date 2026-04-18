"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CloseButton } from "@/components/ui/CloseButton";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  className?: string;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "sm:w-[420px]",
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Side Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            style={{ willChange: "transform", z: 50 }}
            className={cn(
              "fixed top-0 right-0 h-screen w-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col border-l border-zinc-100",
              width,
              className
            )}
          >
            {/* Header */}
            <header className="px-8 py-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-20">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                    {subtitle}
                  </p>
                )}
              </div>
              <CloseButton onClick={onClose} />
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-8 py-10">
              {children}
            </main>

            {/* Footer */}
            {footer && (
              <footer className="px-8 py-8 border-t border-zinc-100 bg-white sticky bottom-0 flex gap-4 shadow-[0_-20px_60px_rgba(0,0,0,0.02)] z-20">
                {footer}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
