"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { cartApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface Totals {
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export const CheckoutSummary = ({ shippingMethod = "standard" }: { shippingMethod?: string }) => {
  const { items, getTotalPrice, getTotalItems, promoCode, discountAmount, setPromo } = useCartStore();
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [localPromo, setLocalPromo] = useState(promoCode || "");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [calculating, setCalculating] = useState(false);

  const subtotal = getTotalPrice();

  // Fetch server-authoritative totals whenever inputs change
  const fetchTotals = useCallback(async () => {
    setCalculating(true);
    try {
      const res = await cartApi.calculateTotals(shippingMethod, promoCode || undefined);
      if (res.data.success && res.data.data) {
        setTotals(res.data.data);
      }
    } catch {
      // Fallback: show client-side estimate if API fails (e.g. guest user)
      const discounted = Math.max(0, subtotal - discountAmount);
      const tax = Math.round(discounted * 0.10 * 100) / 100;
      const shippingRates: Record<string, number> = { standard: 0, express: 9.99, overnight: 24.99 };
      const ship = shippingRates[shippingMethod] ?? 0;
      setTotals({
        subtotal,
        discountAmount,
        discountedSubtotal: discounted,
        shippingCost: ship,
        tax,
        total: Math.round((discounted + tax + ship) * 100) / 100,
      });
    } finally {
      setCalculating(false);
    }
  }, [shippingMethod, promoCode, subtotal, discountAmount]);

  useEffect(() => {
    if (items.length > 0) {
      fetchTotals();
    }
  }, [fetchTotals, items.length]);

  const handleApplyPromo = async () => {
    if (!localPromo) return;
    setPromoStatus("loading");
    try {
      const res = await cartApi.validatePromo(localPromo, subtotal);
      if (res.data.success && res.data.data?.valid) {
        setPromo(localPromo, res.data.data.discountAmount);
        setPromoStatus("success");
      } else {
        setPromo(null, 0);
        setPromoStatus("error");
      }
    } catch {
      setPromoStatus("error");
    }
  };

  return (
    <aside className="lg:sticky lg:top-32 space-y-8">
      <div className="bg-surface-container-low p-8 rounded-xl shadow-[0_20px_50px_rgba(26,28,29,0.03)] border border-white/40">
        <h2 className="text-lg font-medium tracking-tight mb-8">Order Summary ({getTotalItems()})</h2>
        
        <ul className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 group">
              <Link href={`/products/${item.productId}`} className="w-20 h-24 bg-surface-container-high relative overflow-hidden flex-shrink-0 cursor-pointer">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                />
              </Link>
              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <Link href={`/products/${item.productId}`}>
                    <h4 className="text-sm font-medium leading-snug hover:text-primary transition-colors cursor-pointer">{item.name}</h4>
                  </Link>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Promo Code */}
        <div className="space-y-4 mb-8 pt-6 border-t border-outline-variant/10">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={localPromo}
              onChange={(e) => setLocalPromo(e.target.value)}
              placeholder="Promo code"
              className="flex-1 bg-surface-container-high border-0 rounded-md focus:ring-1 focus:ring-primary px-4 py-3 text-xs uppercase tracking-widest placeholder:text-outline-variant/60 outline-none transition-all"
            />
            <Button 
              variant="outline" 
              size="none" 
              onClick={handleApplyPromo}
              isLoading={promoStatus === "loading"}
              className="px-6 py-3 border-primary text-primary hover:bg-primary hover:text-white transition-all scale-100"
            >
              Apply
            </Button>
          </div>
          <AnimatePresence>
            {promoStatus === "success" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-green-600 uppercase tracking-widest flex items-center">
                <span className="material-symbols-outlined text-xs mr-1">check_circle</span> Code Applied
              </motion.p>
            )}
            {promoStatus === "error" && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-error uppercase tracking-widest flex items-center">
                <span className="material-symbols-outlined text-xs mr-1">error</span> Invalid Code
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Totals */}
        <div className="space-y-3 pt-6 border-t border-outline-variant/10">
          {calculating ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-[10px] uppercase tracking-widest text-on-surface-variant">Calculating...</span>
            </div>
          ) : totals ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-label uppercase tracking-widest text-[10px]">Discount</span>
                  <span className="font-medium">-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Shipping</span>
                <span className="font-medium text-primary">{totals.shippingCost > 0 ? formatCurrency(totals.shippingCost) : "Free"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Estimated Tax</span>
                <span className="font-medium">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-medium pt-4 border-t border-outline-variant/10 mt-4 tracking-tighter">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totals.total)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Secure Checkout Badge */}
      <div className="flex items-center justify-center gap-3 text-on-surface-variant/40">
        <span className="material-symbols-outlined text-lg">lock</span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Secure Encrypted Payment</span>
      </div>
    </aside>
  );
};
