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
      setOrderId(orderParam);
    }
    clearCart();
  }, [searchParams, clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-md w-full p-8 border border-outline-variant/10 bg-surface-container-low shadow-sm"
    >
      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-3xl">check_circle</span>
      </div>
      
      <h1 className="text-3xl font-medium tracking-tight">Order Confirmed!</h1>
      
      <p className="text-on-surface-variant text-sm leading-relaxed">
        Thank you for exploring with us. Your curated selection is now being prepared for shipment.
      </p>

      {orderId && (
        <div className="bg-surface py-4 px-6 mt-6 border border-outline-variant/10 rounded-sm">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
            Order Reference
          </p>
          <p className="text-lg font-mono font-bold tracking-tight">#{orderId.toUpperCase()}</p>
        </div>
      )}

      <div className="pt-8">
        <Link href="/products">
          <Button variant="primary" size="none" className="w-full py-4 scale-100">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
      <React.Suspense fallback={<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}>
        <SuccessContent />
      </React.Suspense>
    </main>
  );
}
