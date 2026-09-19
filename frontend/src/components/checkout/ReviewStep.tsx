"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import type { ShippingFormData } from "@/app/(shop)/checkout/page";

interface ReviewStepProps {
  shippingData: ShippingFormData;
  paymentIntentId: string;
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export const ReviewStep = ({
  shippingData,
  paymentIntentId,
  onSuccess,
  onBack,
}: ReviewStepProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { clearCart } = useCartStore();

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Order is already created in PaymentStep, and payment is authorized.
      // paymentIntentId prop now actually holds the orderId passed forward.
      clearCart();
      onSuccess(paymentIntentId);
    } catch {
      setError("An unexpected error occurred finalizing the order UI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 space-y-12 duration-700">
      <div>
        <h1 className="mb-2 text-3xl font-medium tracking-tight">
          Review Your Order
        </h1>
        <p className="text-sm text-on-surface-variant">
          One last check before we finalize everything.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2">
        {/* Shipping Summary */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            Shipping Details
          </h3>
          <div className="space-y-1 rounded-sm border border-outline-variant/10 bg-surface-container-low p-6">
            <p className="font-medium">
              {shippingData.firstName} {shippingData.lastName}
            </p>
            <p className="text-sm text-on-surface-variant">
              {shippingData.email}
            </p>
            <p className="text-sm text-on-surface-variant">
              {shippingData.address}
            </p>
            <p className="text-sm text-on-surface-variant">
              {shippingData.city}, {shippingData.state} {shippingData.zipCode}
            </p>
          </div>
        </div>

        {/* Shipping Method Summary */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            Delivery Method
          </h3>
          <div className="rounded-sm border border-outline-variant/10 bg-surface-container-low p-6">
            <p className="font-medium capitalize">
              {shippingData.shippingMethod}
            </p>
            <p className="text-sm text-on-surface-variant">
              Estimated delivery:{" "}
              {shippingData.shippingMethod === "standard"
                ? "3-5 business days"
                : shippingData.shippingMethod === "express"
                  ? "1-2 business days"
                  : "Next business day"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
          Payment Method
        </h3>
        <div className="rounded-sm border border-outline-variant/10 bg-surface-container-low p-6">
          <p className="font-medium italic">Credit / Debit Card</p>
          <p className="text-sm text-on-surface-variant">
            Ending in •••• (Authorized via Stripe)
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-error/20 bg-error/5 p-4 text-sm font-medium tracking-wider text-error uppercase">
          {error}
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-8">
        <Button
          variant="none"
          size="none"
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium opacity-60 grayscale transition-opacity hover:opacity-70"
          icon={
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
          }
        >
          Back to payment
        </Button>
        <Button
          variant="primary"
          onClick={handlePlaceOrder}
          isLoading={loading}
          className="scale-100 px-10 py-5 font-medium"
        >
          Complete Purchase
        </Button>
      </div>
    </div>
  );
};
