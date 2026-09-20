"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { StepProgress } from "@/components/checkout/StepProgress";
import { ShippingStep } from "@/components/checkout/ShippingStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

import { addressApi, cartApi } from "@/lib/api";

export interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  shippingMethod: "standard" | "express" | "overnight";
  addressId?: string;
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const returnFromStripe = searchParams.get("return_from_stripe");
  const clientSecretParam = searchParams.get("payment_intent_client_secret");
  const paymentIntentParam = searchParams.get("payment_intent");
  const orderIdParam = searchParams.get("order_id");

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string } | null>(null);
  const [serverTotals, setServerTotals] = useState<{
    subtotal: number;
    discountAmount: number;
    discountedSubtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
  } | null>(null);

  const { items: cartItems, discountAmount: storeDiscount } = useCartStore();

  useEffect(() => {
    if (cartItems.length === 0) return;
    cartApi
      .calculateTotals(shippingData?.shippingMethod || "standard", undefined, {
        country: shippingData?.country || "EG",
        addressId: shippingData?.addressId,
      })
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setServerTotals(res.data.data);
        }
      })
      .catch(() => {});
  }, [
    shippingData?.shippingMethod,
    shippingData?.country,
    shippingData?.addressId,
    cartItems.length,
  ]);

  const fallbackSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const subtotal = serverTotals?.subtotal ?? fallbackSubtotal;
  const shipping =
    serverTotals?.shippingCost ??
    (shippingData?.shippingMethod === "overnight"
      ? 24.99
      : shippingData?.shippingMethod === "express"
        ? 9.99
        : 10);
  const discountAmount = serverTotals?.discountAmount ?? storeDiscount;
  const discountedSubtotal =
    serverTotals?.discountedSubtotal ?? Math.max(0, subtotal - storeDiscount);
  const tax =
    serverTotals?.tax ?? Math.round(discountedSubtotal * 0.1 * 100) / 100;
  const total =
    serverTotals?.total ??
    Math.round((discountedSubtotal + shipping + tax) * 100) / 100;

  useEffect(() => {
    // 1. Restore minimal state from sessionStorage securely
    const savedShipping = sessionStorage.getItem("checkout_shipping_data");
    if (savedShipping) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShippingData(JSON.parse(savedShipping));
      } catch (e) {}
    }

    // 2. Handle Stripe redirect
    if (
      stepParam === "review" &&
      (returnFromStripe === "true" || paymentIntentParam)
    ) {
      if (!clientSecretParam) return;

      const validatePayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;

        const { paymentIntent } =
          await stripe.retrievePaymentIntent(clientSecretParam);

        if (
          paymentIntent &&
          (paymentIntent.status === "succeeded" ||
            paymentIntent.status === "processing" ||
            paymentIntent.status === "requires_capture")
        ) {
          setClientSecret(clientSecretParam);
          setPaymentIntentId(orderIdParam || paymentIntent.id);
          setCurrentStep(3);
        } else {
          // Payment failed, return to payment step
          setCurrentStep(2);
        }
      };

      validatePayment();
    }
  }, [
    stepParam,
    returnFromStripe,
    clientSecretParam,
    paymentIntentParam,
    orderIdParam,
  ]);

  const handleShippingNext = async (data: ShippingFormData) => {
    try {
      // Save address to backend to get an addressId
      const addressRes = await addressApi.create({
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.address,
        city: data.city,
        state: data.state,
        zip: data.zipCode,
        country: "US",
        label: "Shipping Address",
      });

      if (addressRes.data.success) {
        const addressData = addressRes.data.data as { id: string };
        const newData = { ...data, addressId: addressData.id };
        setShippingData(newData);
        sessionStorage.setItem(
          "checkout_shipping_data",
          JSON.stringify(newData)
        );
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      // Fallback or show error
    }
  };

  const handlePaymentNext = (secret: string, intentId: string) => {
    setClientSecret(secret);
    setPaymentIntentId(intentId);
    setCurrentStep(3);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:col-span-2"
          >
            <ShippingStep
              onNext={handleShippingNext}
              initialData={shippingData || undefined}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:col-span-2"
          >
            <PaymentStep
              onNext={handlePaymentNext}
              onBack={() => setCurrentStep(1)}
              shippingMethod={shippingData?.shippingMethod || "standard"}
              total={total}
              subtotal={subtotal}
              shipping={shipping}
              discountAmount={discountAmount}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {clientSecret && paymentIntentId && shippingData ? (
              <ReviewStep
                shippingData={shippingData}
                paymentIntentId={paymentIntentId}
                onSuccess={(id) => setOrderSuccess({ id })}
                onBack={() => setCurrentStep(2)}
              />
            ) : (
              <div className="py-20 text-center">
                <p>Payment information missing. Please go back.</p>
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Payment
                </Button>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <header className="fixed top-0 z-50 w-full border-b border-outline-variant/10 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-8">
            <Link href="/" className="text-xl font-medium tracking-tighter">
              THE EDITORIAL
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-medium tracking-widest text-on-surface-variant uppercase">
                Checkout Experience
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-6 pt-32 pb-24 lg:px-12">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_400px] xl:gap-32">
            <div className="space-y-12">
              <StepProgress currentStep={currentStep} />

              <AnimatePresence mode="wait">
                {renderCurrentStep()}
              </AnimatePresence>
            </div>

            <CheckoutSummary
              shippingMethod={shippingData?.shippingMethod || "standard"}
            />
          </div>
        </main>

        {/* Success Overlay */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white p-6 text-center"
            >
              <div className="mb-8 h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 52 52">
                  <motion.circle
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                    stroke="#030304"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <motion.path
                    fill="none"
                    stroke="#030304"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="max-w-sm space-y-6"
              >
                <h2 className="text-4xl font-medium tracking-tight">
                  Order Confirmed!
                </h2>
                <p className="leading-relaxed text-on-surface-variant">
                  Thank you for your purchase. Your order{" "}
                  <span className="font-medium text-primary">
                    #{orderSuccess.id.slice(-8).toUpperCase()}
                  </span>{" "}
                  has been placed successfully.
                </p>
                <div className="pt-8">
                  <Link href="/products">
                    <Button variant="primary" className="w-full py-5">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="w-full border-t border-outline-variant/10 px-12 py-12">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 md:flex-row">
            <span className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
              © 2024 THE EDITORIAL. ALL RIGHTS RESERVED.
            </span>
            <div className="flex gap-8">
              <Link
                href="/"
                className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase transition-colors hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                href="/"
                className="text-[10px] font-medium tracking-widest text-zinc-400 uppercase transition-colors hover:text-primary"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
