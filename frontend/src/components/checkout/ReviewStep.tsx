"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { orderApi } from "@/lib/api";
interface ReviewStepProps {
  shippingData: any;
  paymentIntentId: string;
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export const ReviewStep = ({ shippingData, paymentIntentId, onSuccess, onBack }: ReviewStepProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { clearCart } = useCartStore();

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create the order in our backend with the pre-authorized paymentIntentId
      const { items } = useCartStore.getState();
      const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const shipping = shippingData.shippingMethod === "standard" ? 0 : shippingData.shippingMethod === "express" ? 9.99 : 24.99;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      const orderData = {
        addressId: shippingData.addressId,
        stripePaymentId: paymentIntentId,
        subtotal,
        shipping,
        tax,
        total,
        items: items.map(item => ({
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        notes: "Created via checkout flow"
      };

      const res = await orderApi.create(orderData);
      
      if (res.data.success) {
        clearCart();
        onSuccess(res.data.data.order.id);
      } else {
        setError("Order created but failed to synchronize. Please contact support.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred during order creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
      <div>
        <h1 className="text-3xl font-medium tracking-tight mb-2">Review Your Order</h1>
        <p className="text-on-surface-variant text-sm">One last check before we finalize everything.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Shipping Summary */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Shipping Details</h3>
          <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm space-y-1">
            <p className="font-medium">{shippingData.firstName} {shippingData.lastName}</p>
            <p className="text-sm text-on-surface-variant">{shippingData.email}</p>
            <p className="text-sm text-on-surface-variant">{shippingData.address}</p>
            <p className="text-sm text-on-surface-variant">{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
          </div>
        </div>

        {/* Shipping Method Summary */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Delivery Method</h3>
          <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="font-medium capitalize">{shippingData.shippingMethod}</p>
            <p className="text-sm text-on-surface-variant">Estimated delivery: {
              shippingData.shippingMethod === "standard" ? "3-5 business days" :
              shippingData.shippingMethod === "express" ? "1-2 business days" : "Next business day"
            }</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Payment Method</h3>
        <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm">
          <p className="font-medium italic">Credit / Debit Card</p>
          <p className="text-sm text-on-surface-variant">Ending in •••• (Authorized via Stripe)</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/5 border border-error/20 text-error text-sm font-medium uppercase tracking-wider">
          {error}
        </div>
      )}

      {/* Action Button */}
      <div className="pt-8 flex justify-between items-center border-t border-outline-variant/10">
        <Button 
          variant="none" 
          size="none" 
          type="button"
          onClick={onBack}
          className="text-sm font-medium flex items-center gap-2 hover:opacity-70 transition-opacity grayscale opacity-60"
          icon={<span className="material-symbols-outlined text-lg">arrow_back</span>}
        >
          Back to payment
        </Button>
        <Button 
          variant="primary" 
          onClick={handlePlaceOrder}
          isLoading={loading}
          className="px-10 py-5 scale-100 font-medium"
        >
          Complete Purchase
        </Button>
      </div>
    </div>
  );
};
