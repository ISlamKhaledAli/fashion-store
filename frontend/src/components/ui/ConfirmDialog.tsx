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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 pointer-events-auto"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              confirmBrand === "danger" ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-900"
            )}>
              <AlertTriangle strokeWidth={2} size={20} />
            </div>
            
            <div className="flex-1 w-full pt-1">
              <h3 id="confirm-dialog-title" className="text-lg font-bold text-zinc-950 tracking-tight">
                {title}
              </h3>
              <p id="confirm-dialog-description" className="mt-2 text-sm text-zinc-500 leading-relaxed">
                {description}
              </p>
            </div>
            <CloseButton
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 hover:bg-zinc-100 cursor-pointer"
              size={18}
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto hover:bg-zinc-100 rounded-lg shadow-sm border-zinc-200 font-medium"
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={confirmBrand === "danger" ? "primary" : confirmBrand}
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto rounded-lg shadow-md font-medium text-white transition-all",
              confirmBrand === "danger" 
                ? "bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-px border-red-600" 
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
