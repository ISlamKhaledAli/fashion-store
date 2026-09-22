"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { CloseButton } from "./CloseButton";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmBrand?: "danger" | "primary" | "outline";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmBrand = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Auto focus the primary action (or cancel depending on preference, here we focus confirm for easy flow)
      setTimeout(() => confirmButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-md duration-200"
      onClick={handleOverlayClick}
    >
      <div className="animate-in zoom-in-95 slide-in-from-bottom-2 pointer-events-auto relative w-full max-w-[380px] overflow-hidden rounded-3xl border border-stone-200/80 bg-white/95 p-6 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl duration-300">
        <CloseButton
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 cursor-pointer rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          size={16}
        />

        {/* Top Badge Icon */}
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner",
            confirmBrand === "danger"
              ? "border-red-200 bg-red-50/80 text-red-600"
              : "border-stone-200/90 bg-gradient-to-b from-stone-50 to-stone-100 text-stone-900"
          )}
        >
          <AlertTriangle strokeWidth={1.8} size={22} />
        </div>

        {/* Brand Tagline */}
        <p className="mt-4 font-mono text-[9px] font-bold tracking-[0.24em] text-stone-400 uppercase">
          The Curator Atelier
        </p>

        {/* Editorial Title */}
        <h3
          id="confirm-dialog-title"
          className="mt-1 font-sans text-xl font-bold tracking-tight text-stone-900"
        >
          {title}
        </h3>

        {/* Description */}
        <p
          id="confirm-dialog-description"
          className="mt-2 font-sans text-xs leading-relaxed text-stone-500"
        >
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl border border-stone-200 bg-white py-2.5 font-sans text-xs font-semibold text-stone-700 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 cursor-pointer rounded-xl py-2.5 font-sans text-xs font-semibold text-white shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50",
              confirmBrand === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "hover:bg-stone-850 bg-stone-950"
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
