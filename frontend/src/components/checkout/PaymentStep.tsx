"use client";

import React, { useState, useEffect } from "react";
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { addressApi } from "@/lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

interface PaymentStepProps {
  onNext: (clientSecret: string, paymentIntentId: string) => void;
  onBack: () => void;
  shippingMethod?: string;
}

interface CheckoutFormProps extends PaymentStepProps {
  paymentIntentId: string | null;
  addressId: string | null;
  promoCode: string | null;
}

const CheckoutForm = ({ onNext, onBack, paymentIntentId, addressId, shippingMethod, promoCode }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !paymentIntentId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Trigger form validation and data collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "An error occurred.");
        setLoading(false);
        return;
      }

      // 2. Create the order FIRST (status: PENDING/UNPAID)
      // We pass the existing paymentIntentId so the backend links them
      let orderId = "";
      try {
        const orderRes = await api.post("/orders", {
          addressId,
          stripePaymentId: paymentIntentId,
          notes: "Created via checkout flow",
          shippingMethod,
          promoCode: promoCode || undefined,
        });
        if (orderRes.data.success) {
          orderId = orderRes.data.data.order.id;
        } else {
          setError("Order creation failed.");
          setLoading(false);
          return;
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Order creation failed. Please check your cart.");
        setLoading(false);
        return;
      }

      // 3. Confirm the payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?step=review&return_from_stripe=true&order_id=${orderId}`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        // Payment failed — order stays in DB as PENDING/UNPAID, user can retry
        setError(confirmError.message || "Payment confirmation failed");
        setLoading(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        // 4. Verification/Acknowledge Success (Frontend confirmation)
        try {
          await api.put(`/orders/${orderId}/payment`, {
            stripePaymentId: paymentIntent.id,
            paymentStatus: "PAID"
          });
        } catch (err) {
          // Soft failure — the webhook will catch it anyway
          console.error("Failed to acknowledge payment success on frontend:", err);
        }

        // 5. Success — pass the order ID up to the parent
        onNext(paymentIntent.client_secret || "", orderId);
      } else {
        setError("Payment was not completed. Please try again.");
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">Payment Method</h2>
        <p className="text-on-surface-variant text-sm">All transactions are secure and encrypted.</p>
      </div>

      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <p className="text-sm text-error font-medium uppercase tracking-wider">{error}</p>
      )}

      <div className="pt-8 flex justify-between items-center border-t border-outline-variant/10">
        <Button 
          variant="none" 
          size="none" 
          type="button"
          onClick={onBack}
          className="text-sm font-medium flex items-center gap-2 hover:opacity-70 transition-opacity grayscale opacity-60"
          icon={<span className="material-symbols-outlined text-lg">arrow_back</span>}
        >
          Back to shipping
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          isLoading={loading}
          className="px-10 py-5 scale-100 font-medium"
        >
          Review Order
        </Button>
      </div>
    </form>
  );
};

export const PaymentStep = ({ onNext, onBack, shippingMethod = "standard" }: PaymentStepProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTotalPrice, promoCode, discountAmount } = useCartStore();
  const [lastTotal, setLastTotal] = useState(0);

  // Calculate current total for dependency tracking
  const subtotal = getTotalPrice();
  const currentTotal = subtotal + 10 - discountAmount; // Simplified local total for diffing

  useEffect(() => {
    const fetchIntent = async () => {
      if (currentTotal <= 0) return;
      
      setLoading(true);
      setError(null);
      try {
        const addressRes = await addressApi.getAll();
        const addresses = (addressRes.data?.data || []) as { id: string }[];
        setAddressId(addresses[0]?.id || null);

        const token = useAuthStore.getState().accessToken;


        const res = await api.post(
          "/payment/intent", 
          { 
            amount: subtotal,
            shippingMethod,
            promoCode: promoCode || undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setClientSecret(res.data.data.clientSecret);
          setPaymentIntentId(res.data.data.paymentIntentId);
          setLastTotal(currentTotal);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (currentTotal !== lastTotal && currentTotal > 0) {
      fetchIntent();
    }
  }, [currentTotal, shippingMethod, promoCode, lastTotal, subtotal]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-on-surface-variant">Securing transaction...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-error">Failed to initialize payment. Please try again.</p>
        <Button variant="outline" onClick={onBack}>Back to Shipping</Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutForm 
        onNext={onNext} 
        onBack={onBack} 
        paymentIntentId={paymentIntentId} 
        addressId={addressId} 
        shippingMethod={shippingMethod}
        promoCode={promoCode}
      />
    </Elements>
  );
};
