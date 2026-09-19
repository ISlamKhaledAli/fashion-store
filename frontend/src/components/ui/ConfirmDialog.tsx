"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
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
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm duration-200"
      onClick={handleOverlayClick}
    >
      <div className="animate-in zoom-in-95 slide-in-from-bottom-2 pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl duration-300">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                confirmBrand === "danger"
                  ? "bg-red-50 text-red-600"
                  : "bg-zinc-100 text-zinc-900"
              )}
            >
              <AlertTriangle strokeWidth={2} size={20} />
            </div>

            <div className="w-full flex-1 pt-1">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-bold tracking-tight text-zinc-950"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-description"
                className="mt-2 text-sm leading-relaxed text-zinc-500"
              >
                {description}
              </p>
            </div>
            <CloseButton
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer p-1.5 hover:bg-zinc-100"
              size={18}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-lg border-zinc-200 font-medium shadow-sm hover:bg-zinc-100 sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={confirmBrand === "danger" ? "primary" : confirmBrand}
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg font-medium text-white shadow-md transition-all sm:w-auto",
              confirmBrand === "danger"
                ? "border-red-600 bg-red-600 hover:-translate-y-px hover:bg-red-700 hover:shadow-lg"
                : "bg-zinc-900"
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
