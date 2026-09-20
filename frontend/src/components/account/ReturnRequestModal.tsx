"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { returnApi } from "@/lib/api";
import type { Order } from "@/types";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ReturnRequestModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  { value: "SIZE_FIT", label: "Size or Fit Issue" },
  { value: "DAMAGED", label: "Damaged Upon Arrival" },
  { value: "NOT_AS_DESCRIBED", label: "Item Not As Described" },
  { value: "DEFECTIVE", label: "Defective Fabric or Stitching" },
  { value: "CHANGED_MIND", label: "Changed Mind / Preference" },
  { value: "OTHER", label: "Other Inquiries" },
];

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState(RETURN_REASONS[0].value);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a valid return reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await returnApi.create({
        orderId: order.id,
        reason,
        description: description.trim() || undefined,
      });

      if (res.data.success) {
        toast.success("Return request submitted successfully", {
          description:
            "Our concierge atelier will review your request within 24 hours.",
        });
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit return request. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface p-6 shadow-2xl sm:p-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <RotateCcw size={20} />
            </div>
            <div>
              <h2 className="text-xl font-medium tracking-tight text-on-surface">
                Request Order Return
              </h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                Order #{order.id.slice(-6).toUpperCase()} &bull; Placed{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Order Summary Snapshot */}
          <div className="mb-6 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Items in order:</span>
              <span className="font-semibold text-on-surface">
                {order.items.length} item{order.items.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Order Total:</span>
              <span className="font-serif font-bold text-on-surface">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Reason selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                Return Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                Additional Atelier Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any details regarding fit, condition, or collection preferences..."
                rows={3}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Courier Collection Policy Note */}
            <div className="flex items-start gap-2.5 rounded-lg bg-surface-container-high/40 p-3 text-xs text-on-surface-variant">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <span>
                Complimentary courier pickup will be coordinated to your
                original delivery address once reviewed by the concierge.
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="gap-2"
              >
                <CheckCircle2 size={16} />
                Submit Return Request
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
