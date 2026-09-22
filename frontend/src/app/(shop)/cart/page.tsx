"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { cartApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    setPromo,
    syncingIds,
  } = useCartStore();

  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed for hydration check
    setIsMounted(true);

    // Background sync — non-blocking, only for authenticated users
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    cartApi
      .get()
      .then((res) => {
        if (res.data.success) {
          useCartStore.getState().syncFromServer(res.data.data);
        }
      })
      .catch(() => {}); // silent fail
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
        setPromo(promoCode, res.data.data.discountAmount);
      } else {
        setPromoStatus("error");
        setPromoMessage(res.data.data?.message || "Invalid promo code");
        setPromo(null, 0);
      }
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setPromoStatus("error");
      setPromoMessage(
        axiosErr.response?.data?.message || "Error validating code"
      );
    }
  };

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1440px] flex-col items-center justify-center px-8 pt-32 pb-24">
        <h1 className="mb-6 text-4xl font-medium tracking-tighter md:text-5xl">
          Your Bag is Empty
        </h1>
        <p className="mb-12 font-label text-sm tracking-widest text-on-surface-variant uppercase">
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
  // Pre-checkout estimate only — the real calculation happens server-side at checkout
  const estimatedTax =
    Math.round(Math.max(0, subtotal - discountAmount) * 0.1 * 100) / 100;
  const estimatedTotal =
    Math.round((Math.max(0, subtotal - discountAmount) + estimatedTax) * 100) /
    100;

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-8 pt-32 pb-24">
      <div className="mb-12">
        <h1 className="mb-2 text-4xl font-medium tracking-tighter md:text-5xl">
          Your Bag
        </h1>
        <p className="font-label text-sm tracking-widest text-on-surface-variant uppercase">
          {getTotalItems()} Items — Curated Selection
        </p>
      </div>

      <div className="flex flex-col gap-16 lg:flex-row">
        {/* Left Column: Cart Items */}
        <div className="lg:w-[65%]">
          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id || item.variantId || `cart-item-${index}`}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: -20,
                    height: 0,
                    marginBottom: 0,
                    paddingBottom: 0,
                    overflow: "hidden",
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col gap-8 border-b border-outline-variant/10 pb-12 sm:flex-row"
                >
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative flex aspect-[3/4] w-full cursor-pointer items-center justify-center overflow-hidden bg-surface-container-low sm:w-40"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 160px"
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-zinc-400 dark:text-stone-600">
                        checkroom
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="mb-1 cursor-pointer text-xl font-medium tracking-tight transition-colors hover:text-primary">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="mb-6 text-sm tracking-wider text-on-surface-variant uppercase">
                          Size: {item.size} / Color: {item.color}
                        </p>
                        <div className="flex w-fit items-center space-x-6 rounded-sm bg-surface-container-low px-4 py-2">
                          <Button
                            variant="none"
                            size="none"
                            onClick={() => {
                              const newQty = Math.max(1, item.quantity - 1);
                              if (newQty !== item.quantity) {
                                updateQuantity(item.id, newQty);
                              }
                            }}
                            disabled={syncingIds.includes(item.id)}
                            className="flex items-center justify-center p-2 text-on-surface-variant transition-colors hover:text-on-surface"
                            icon={
                              <span className="material-symbols-outlined text-sm">
                                remove
                              </span>
                            }
                          />
                          <span className="w-8 shrink-0 text-center text-sm font-medium">
                            {syncingIds.includes(item.id) ? (
                              <div className="mx-auto h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <Button
                            variant="none"
                            size="none"
                            onClick={() => {
                              const newQty = item.quantity + 1;
                              updateQuantity(item.id, newQty);
                            }}
                            disabled={syncingIds.includes(item.id)}
                            className="flex items-center justify-center p-2 text-on-surface-variant transition-colors hover:text-on-surface"
                            icon={
                              <span className="material-symbols-outlined text-sm">
                                add
                              </span>
                            }
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
                          onClick={() => {
                            removeItem(item.id);
                          }}
                          disabled={syncingIds.includes(item.id)}
                          className="group/del mt-6 p-2 text-on-surface-variant transition-colors duration-300 hover:text-error"
                          icon={
                            <span
                              className="material-symbols-outlined transition-transform group-hover/del:scale-110"
                              data-icon="delete"
                            >
                              delete
                            </span>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-12">
            <Link
              href="/products"
              className="group inline-flex items-center text-on-surface-variant transition-colors duration-300 hover:text-on-surface"
            >
              <span className="material-symbols-outlined mr-2 transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              <span className="border-b border-on-surface-variant/20 pb-0.5 font-label text-xs tracking-widest uppercase">
                Continue Shopping
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="lg:w-[35%]">
          <div className="sticky top-32 border border-outline-variant/5 bg-white p-8 shadow-[0_20px_50px_rgba(26,28,29,0.05)]">
            <h2 className="mb-8 text-2xl font-medium tracking-tight">
              Summary
            </h2>
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between font-label text-sm tracking-wide">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between font-label text-sm tracking-wide">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-[10px] tracking-[0.2em] text-on-surface-variant/60 uppercase">
                  Calculated at next step
                </span>
              </div>
              <div className="flex items-center justify-between font-label text-sm tracking-wide">
                <span className="text-on-surface-variant">Estimated Tax</span>
                <span className="font-medium">
                  {formatCurrency(estimatedTax)}
                </span>
              </div>
              {discountAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between font-label text-sm tracking-wide text-green-600"
                >
                  <span className="text-[10px] tracking-widest uppercase">
                    Discount Applied
                  </span>
                  <span className="font-medium">
                    -{formatCurrency(discountAmount)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Promo Code Section */}
            <div className="mb-8 border-t border-b border-outline-variant/10">
              <Button
                variant="none"
                size="none"
                onClick={() => setIsPromoOpen(!isPromoOpen)}
                className="flex w-full items-center justify-between py-4 font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase transition-colors hover:text-on-surface"
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
                        className="flex-1 rounded-md border-none bg-surface-container-low px-4 py-3 text-xs tracking-widest uppercase transition-all outline-none focus:ring-1 focus:ring-primary"
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
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 flex items-center text-[10px] tracking-widest text-green-600 uppercase"
                      >
                        <span className="material-symbols-outlined mr-1 text-xs">
                          check_circle
                        </span>{" "}
                        Code Applied: {formatCurrency(discountAmount)} off
                      </motion.p>
                    )}
                    {promoStatus === "error" && (
                      <motion.p
                        initial={{ x: [-5, 5, -5, 5, 0] }}
                        className="mt-2 flex items-center text-[10px] tracking-widest text-error uppercase"
                      >
                        <span className="material-symbols-outlined mr-1 text-xs">
                          error
                        </span>{" "}
                        {promoMessage || "Invalid Promo Code"}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-10 flex items-center justify-between pt-2">
              <span className="text-lg font-medium">Total</span>
              <motion.span
                key={estimatedTotal}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold tracking-tight text-primary"
              >
                {formatCurrency(estimatedTotal)}
              </motion.span>
            </div>

            <Link href="/checkout">
              <Button
                variant="primary"
                size="none"
                className="w-full scale-100 py-5"
              >
                Proceed to Checkout
              </Button>
            </Link>

            <div className="mt-8 flex items-center justify-center space-x-2 text-on-surface-variant/40">
              <span
                className="material-symbols-outlined text-xs"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <span className="text-[9px] font-medium tracking-[0.2em] uppercase">
                Secure Checkout Powered by Curator
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
