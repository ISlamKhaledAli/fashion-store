"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { StepProgress } from "@/components/checkout/StepProgress";
import { ShippingStep } from "@/components/checkout/ShippingStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

import { orderApi, addressApi } from "@/lib/api";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const returnFromStripe = searchParams.get("return_from_stripe");
  const clientSecretParam = searchParams.get("payment_intent_client_secret");
  const paymentIntentParam = searchParams.get("payment_intent");
  const orderIdParam = searchParams.get("order_id");

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // 1. Restore minimal state from sessionStorage securely
    const savedShipping = sessionStorage.getItem("checkout_shipping_data");
    if (savedShipping) {
      try {
        setShippingData(JSON.parse(savedShipping));
      } catch (e) {}
    }

    // 2. Handle Stripe redirect
    if (stepParam === "review" && (returnFromStripe === "true" || paymentIntentParam)) {
      if (!clientSecretParam) return;

      const validatePayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;

        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecretParam);

        if (paymentIntent && (
          paymentIntent.status === "succeeded" || 
          paymentIntent.status === "processing" || 
          paymentIntent.status === "requires_capture"
        )) {
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
  }, [stepParam, returnFromStripe, clientSecretParam, paymentIntentParam, orderIdParam]);

  const handleShippingNext = async (data: any) => {
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
        label: "Shipping Address"
      });

      if (addressRes.data.success) {
        const newData = { ...data, addressId: addressRes.data.data.id };
        setShippingData(newData);
        sessionStorage.setItem("checkout_shipping_data", JSON.stringify(newData));
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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ShippingStep 
              onNext={handleShippingNext} 
              initialData={shippingData} 
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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <PaymentStep 
              onNext={handlePaymentNext} 
              onBack={() => setCurrentStep(1)}
              shippingMethod={shippingData?.shippingMethod || "standard"}
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
            {clientSecret && paymentIntentId ? (
              <ReviewStep 
                shippingData={shippingData} 
                paymentIntentId={paymentIntentId}
                onSuccess={(id) => setOrderSuccess({ id })}
                onBack={() => setCurrentStep(2)}
              />
            ) : (
              <div className="text-center py-20">
                <p>Payment information missing. Please go back.</p>
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back to Payment</Button>
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
      <div className="bg-surface min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex justify-between items-center h-20 px-8 max-w-[1440px] mx-auto">
          <Link href="/" className="text-xl font-medium tracking-tighter">THE EDITORIAL</Link>
          <div className="flex items-center gap-4">
             <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Checkout Experience</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 xl:gap-32 items-start">
          
          <div className="space-y-12">
            <StepProgress currentStep={currentStep} />
            
            <AnimatePresence mode="wait">
              {renderCurrentStep()}
            </AnimatePresence>
          </div>

          <CheckoutSummary shippingMethod={shippingData?.shippingMethod || "standard"} />
        </div>
      </main>

      {/* Success Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-24 h-24 mb-8">
              <svg className="w-full h-full" viewBox="0 0 52 52">
                <motion.circle 
                  cx="26" cy="26" r="25" 
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
                  transition={{ duration: 0.5, delay: 0.5, ease: "easeInOut" }}
                />
              </svg>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-6 max-w-sm"
            >
              <h2 className="text-4xl font-medium tracking-tight">Order Confirmed!</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Thank you for your purchase. Your order <span className="text-primary font-medium">#{orderSuccess.id.slice(-8).toUpperCase()}</span> has been placed successfully.
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
      <footer className="w-full py-12 px-12 border-t border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] font-medium tracking-widest uppercase text-zinc-400">© 2024 THE EDITORIAL. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-8">
            <Link href="/" className="text-[10px] font-medium tracking-widest uppercase text-zinc-400 hover:text-primary transition-colors">Privacy</Link>
            <Link href="/" className="text-[10px] font-medium tracking-widest uppercase text-zinc-400 hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
