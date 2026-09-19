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

export const CheckoutSummary = ({
  shippingMethod = "standard",
}: {
  shippingMethod?: string;
}) => {
  const {
    items,
    getTotalPrice,
    getTotalItems,
    promoCode,
    discountAmount,
    setPromo,
  } = useCartStore();
  const [promoStatus, setPromoStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [localPromo, setLocalPromo] = useState(promoCode || "");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [calculating, setCalculating] = useState(false);

  const subtotal = getTotalPrice();

  // Fetch server-authoritative totals whenever inputs change
  const fetchTotals = useCallback(async () => {
    setCalculating(true);
    try {
      const res = await cartApi.calculateTotals(
        shippingMethod,
        promoCode || undefined
      );
      if (res.data.success && res.data.data) {
        setTotals(res.data.data);
      }
    } catch {
      // Fallback: show minimal client-side estimate if API fails
      // Note: We do NOT hardcode shipping rates here anymore.
      const discounted = Math.max(0, subtotal - discountAmount);
      const tax = Math.round(discounted * 0.1 * 100) / 100;
      setTotals({
        subtotal,
        discountAmount,
        discountedSubtotal: discounted,
        shippingCost: 0, // Not estimating shipping
        tax,
        total: Math.round((discounted + tax) * 100) / 100,
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
    <aside className="space-y-8 lg:sticky lg:top-32">
      <div className="rounded-xl border border-white/40 bg-surface-container-low p-8 shadow-[0_20px_50px_rgba(26,28,29,0.03)]">
        <h2 className="mb-8 text-lg font-medium tracking-tight">
          Order Summary ({getTotalItems()})
        </h2>

        <ul className="custom-scrollbar no-scrollbar mb-8 max-h-[400px] space-y-6 overflow-y-auto pr-2">
          {items.map((item) => (
            <li key={item.id} className="group flex gap-4">
              <Link
                href={`/products/${item.productId}`}
                className="relative flex h-24 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-surface-container-high"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <span className="material-symbols-outlined text-2xl text-zinc-400">
                    checkroom
                  </span>
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                  <Link href={`/products/${item.productId}`}>
                    <h4 className="cursor-pointer text-sm leading-snug font-medium transition-colors hover:text-primary">
                      {item.name}
                    </h4>
                  </Link>
                  <p className="mt-1 text-[10px] tracking-wider text-on-surface-variant uppercase">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Promo Code */}
        <div className="mb-8 space-y-4 border-t border-outline-variant/10 pt-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={localPromo}
              onChange={(e) => setLocalPromo(e.target.value)}
              placeholder="Promo code"
              className="flex-1 rounded-md border-0 bg-surface-container-high px-4 py-3 text-xs tracking-widest uppercase transition-all outline-none placeholder:text-outline-variant/60 focus:ring-1 focus:ring-primary"
            />
            <Button
              variant="outline"
              size="none"
              onClick={handleApplyPromo}
              isLoading={promoStatus === "loading"}
              className="scale-100 border-primary px-6 py-3 text-primary transition-all hover:bg-primary hover:text-white"
            >
              Apply
            </Button>
          </div>
          <AnimatePresence>
            {promoStatus === "success" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center text-[10px] tracking-widest text-green-600 uppercase"
              >
                <span className="material-symbols-outlined mr-1 text-xs">
                  check_circle
                </span>{" "}
                Code Applied
              </motion.p>
            )}
            {promoStatus === "error" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center text-[10px] tracking-widest text-error uppercase"
              >
                <span className="material-symbols-outlined mr-1 text-xs">
                  error
                </span>{" "}
                Invalid Code
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Totals */}
        <div className="space-y-3 border-t border-outline-variant/10 pt-6">
          {calculating ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-3 text-[10px] tracking-widest text-on-surface-variant uppercase">
                Calculating...
              </span>
            </div>
          ) : totals ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Subtotal
                </span>
                <span className="font-medium">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-label text-[10px] tracking-widest uppercase">
                    Discount
                  </span>
                  <span className="font-medium">
                    -{formatCurrency(totals.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Shipping
                </span>
                <span className="font-medium text-primary">
                  {totals.shippingCost > 0
                    ? formatCurrency(totals.shippingCost)
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Estimated Tax
                </span>
                <span className="font-medium">
                  {formatCurrency(totals.tax)}
                </span>
              </div>
              <div className="mt-4 flex justify-between border-t border-outline-variant/10 pt-4 text-xl font-medium tracking-tighter">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                Subtotal
              </span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Secure Checkout Badge */}
      <div className="flex items-center justify-center gap-3 text-on-surface-variant/40">
        <span className="material-symbols-outlined text-lg">lock</span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
          Secure Encrypted Payment
        </span>
      </div>
    </aside>
  );
};
