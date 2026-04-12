"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { cartApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();
  
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Sync with backend on mount
    const syncCart = async () => {
      try {
        await cartApi.get();
      } catch {
        // Silently ignore — user may not be authenticated
      }
    };
    syncCart();
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoStatus("loading");
    setDiscountAmount(0);
    setPromoMessage("");
    
    try {
      const subtotal = getTotalPrice();
      const res = await cartApi.validatePromo(promoCode, subtotal);
      
      if (res.data.success && res.data.data?.valid) {
        setPromoStatus("success");
        setDiscountAmount(res.data.data.discountAmount);
      } else {
        setPromoStatus("error");
        setPromoMessage(res.data.data?.message || "Invalid promo code");
      }
    } catch (err: any) {
      setPromoStatus("error");
      setPromoMessage(err.response?.data?.message || "Error validating code");
    }
  };

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-6">Your Bag is Empty</h1>
        <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mb-12">
          Curate your collection with our latest arrivals
        </p>
        <Link href="/products">
          <Button variant="primary" size="lg">
            Explore All Products
          </Button>
        </Link>
      </main>
    );
  }

  const subtotal = getTotalPrice();
  const taxSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = taxSubtotal * 0.085; // Mock 8.5% tax
  const total = taxSubtotal + tax;

  return (
    <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">Your Bag</h1>
        <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">
          {getTotalItems()} Items — Curated Selection
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Column: Cart Items */}
        <div className="lg:w-[65%]">
          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: -20,
                    height: 0,
                    marginBottom: 0,
                    paddingBottom: 0,
                    overflow: "hidden" 
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-8 pb-12 border-b border-outline-variant/10 group"
                >
                  <div className="w-full sm:w-40 aspect-[3/4] bg-surface-container-low overflow-hidden relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 160px"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-medium tracking-tight mb-1">{item.name}</h3>
                        <p className="text-on-surface-variant text-sm mb-6 uppercase tracking-wider">
                          Size: {item.size} / Color: {item.color}
                        </p>
                        <div className="flex items-center space-x-6 bg-surface-container-low w-fit px-4 py-2 rounded-sm">
                          <Button 
                            variant="none"
                            size="none"
                            onClick={() => {
                              const newQty = Math.max(1, item.quantity - 1);
                              if (newQty !== item.quantity) {
                                updateQuantity(item.id, newQty);
                                cartApi.updateQuantity(item.id, newQty);
                              }
                            }}
                            className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center p-2"
                            icon={<span className="material-symbols-outlined text-sm">remove</span>}
                          />
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <Button 
                            variant="none"
                            size="none"
                            onClick={() => {
                              const newQty = item.quantity + 1;
                              updateQuantity(item.id, newQty);
                              cartApi.updateQuantity(item.id, newQty);
                            }}
                            className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center p-2"
                            icon={<span className="material-symbols-outlined text-sm">add</span>}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.p 
                          key={item.price * item.quantity}
                          initial={{ opacity: 0.5, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-lg font-medium"
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </motion.p>
                        <Button 
                          variant="ghost"
                          size="none"
                          onClick={async () => {
                            removeItem(item.id);
                            await cartApi.removeItem(item.id);
                          }}
                          className="mt-6 text-on-surface-variant hover:text-error transition-colors duration-300 group/del p-2"
                          icon={<span className="material-symbols-outlined group-hover/del:scale-110 transition-transform" data-icon="delete">delete</span>}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-12">
            <Link href="/products" className="inline-flex items-center group text-on-surface-variant hover:text-on-surface transition-colors duration-300">
              <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="font-label text-xs uppercase tracking-widest border-b border-on-surface-variant/20 pb-0.5">Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="lg:w-[35%]">
          <div className="sticky top-32 bg-white p-8 shadow-[0_20px_50px_rgba(26,28,29,0.05)] border border-outline-variant/5">
            <h2 className="text-2xl font-medium tracking-tight mb-8">Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm font-label tracking-wide">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-label tracking-wide">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">Calculated at next step</span>
              </div>
              <div className="flex justify-between items-center text-sm font-label tracking-wide">
                <span className="text-on-surface-variant">Estimated Tax</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              {discountAmount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center text-sm font-label tracking-wide text-green-600"
                >
                  <span className="uppercase tracking-widest text-[10px]">Discount Applied</span>
                  <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                </motion.div>
              )}
            </div>

            {/* Promo Code Section */}
            <div className="mb-8 border-t border-b border-outline-variant/10">
              <Button 
                variant="none"
                size="none"
                onClick={() => setIsPromoOpen(!isPromoOpen)}
                className="flex items-center justify-between w-full py-4 text-[10px] font-label tracking-[0.2em] uppercase text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Apply Promo Code
                <motion.span 
                  animate={{ rotate: isPromoOpen ? 45 : 0 }}
                  className="material-symbols-outlined"
                >
                  add
                </motion.span>
              </Button>
              
              <AnimatePresence>
                {isPromoOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pb-4"
                  >
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 bg-surface-container-low border-none px-4 py-3 text-xs uppercase tracking-widest focus:ring-1 focus:ring-primary outline-none"
                      />
                      <Button 
                        variant="primary"
                        onClick={handleApplyPromo}
                        isLoading={promoStatus === "loading"}
                        className="px-6 py-3"
                      >
                        Apply
                      </Button>
                    </div>
                    {promoStatus === "success" && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-green-600 uppercase tracking-widest mt-2 flex items-center">
                        <span className="material-symbols-outlined text-xs mr-1">check_circle</span> Code Applied: {formatCurrency(discountAmount)} off
                      </motion.p>
                    )}
                    {promoStatus === "error" && (
                      <motion.p initial={{ x: [-5, 5, -5, 5, 0] }} className="text-[10px] text-error uppercase tracking-widest mt-2 flex items-center">
                        <span className="material-symbols-outlined text-xs mr-1">error</span> {promoMessage || "Invalid Promo Code"}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center pt-2 mb-10">
              <span className="text-lg font-medium">Total</span>
              <motion.span 
                key={total}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold tracking-tight text-primary"
              >
                {formatCurrency(total)}
              </motion.span>
            </div>

            <Link href="/checkout">
              <Button 
                variant="primary" 
                size="none" 
                className="w-full py-5 scale-100"
              >
                Proceed to Checkout
              </Button>
            </Link>

            <div className="mt-8 flex items-center justify-center text-on-surface-variant/40 space-x-2">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium">Secure Checkout Powered by Curator</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
