"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { cartApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export const CheckoutSummary = () => {
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getTotalPrice();
  // Matching backend logic: $10 shipping, 10% tax
  const shipping = items.length > 0 ? 10 : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.1;
  const total = taxableAmount + shipping + tax;

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoStatus("loading");
    try {
      const res = await cartApi.validatePromo(promoCode, subtotal);
      if (res.data.success && res.data.data?.valid) {
        setDiscountAmount(res.data.data.discountAmount);
        setPromoStatus("success");
      } else {
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
              <div className="w-20 h-24 bg-surface-container-high relative overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <h4 className="text-sm font-medium leading-snug">{item.name}</h4>
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
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
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
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="font-label uppercase tracking-widest text-[10px]">Discount</span>
              <span className="font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Shipping</span>
            <span className="font-medium text-primary">{shipping > 0 ? formatCurrency(shipping) : "Free"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px]">Estimated Tax</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-xl font-medium pt-4 border-t border-outline-variant/10 mt-4 tracking-tighter">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
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
