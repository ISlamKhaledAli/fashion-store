"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const { clearCart } = useCartStore();

  useEffect(() => {
    const orderParam = searchParams.get("orderId");
    if (orderParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderId(orderParam);
    }
    clearCart();
  }, [searchParams, clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md space-y-6 border border-outline-variant/10 bg-surface-container-low p-8 shadow-sm"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <span className="material-symbols-outlined text-3xl">check_circle</span>
      </div>

      <h1 className="text-3xl font-medium tracking-tight">Order Confirmed!</h1>

      <p className="text-sm leading-relaxed text-on-surface-variant">
        Thank you for exploring with us. Your curated selection is now being
        prepared for shipment.
      </p>

      {orderId && (
        <div className="mt-6 rounded-sm border border-outline-variant/10 bg-surface px-6 py-4">
          <p className="mb-1 text-[10px] tracking-widest text-on-surface-variant uppercase">
            Order Reference
          </p>
          <p className="font-mono text-lg font-bold tracking-tight">
            #{orderId.toUpperCase()}
          </p>
        </div>
      )}

      <div className="pt-8">
        <Link href="/products">
          <Button
            variant="primary"
            size="none"
            className="w-full scale-100 py-4"
          >
            Continue Shopping
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1440px] flex-col items-center justify-center px-8 pt-32 pb-24 text-center">
      <React.Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        }
      >
        <SuccessContent />
      </React.Suspense>
    </main>
  );
}
