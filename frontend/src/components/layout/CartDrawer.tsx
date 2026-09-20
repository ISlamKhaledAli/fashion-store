"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Truck, Check } from "lucide-react";
import { contentApi } from "@/lib/api";

export const CartDrawer = () => {
  const {
    items,
    isOpen,
    toggleDrawer,
    removeItem,
    updateQuantity,
    getTotalPrice,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("curator_admin_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.freeShippingThreshold) {
            return Number(parsed.freeShippingThreshold);
          }
        }
      } catch {}
    }
    return 250;
  });

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<{ freeShippingThreshold: number }>("admin_settings")
      .then((res) => {
        if (isMounted && res.data?.data?.freeShippingThreshold) {
          setFreeShippingThreshold(Number(res.data.data.freeShippingThreshold));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const subtotal = getTotalPrice();
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const shouldAnimate = items.length <= 5;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleDrawer(false)}
            className="fixed inset-0 z-[55] bg-stone-950/40 backdrop-blur-sm transition-opacity duration-700"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed right-0 z-[60] flex h-full w-full max-w-[450px] flex-col bg-surface shadow-[0_20px_50px_rgba(26,28,29,0.05)] dark:bg-stone-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-6 sm:p-8">
              <div>
                <h2 className="text-lg font-bold text-on-surface dark:text-stone-50">
                  Your Bag ({items.length})
                </h2>
                <p className="mt-1 text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
                  Review your curated selection
                </p>
              </div>
              <Button
                variant="icon"
                size="none"
                onClick={() => toggleDrawer(false)}
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2 transition-colors hover:bg-surface-container-low dark:hover:bg-stone-900"
                icon={
                  <span className="material-symbols-outlined text-on-surface transition-transform duration-500 group-hover:rotate-90 dark:text-stone-50">
                    close
                  </span>
                }
              />
            </div>

            {/* Free Shipping Indicator */}
            {items.length > 0 && (
              <div className="border-b border-outline-variant/10 bg-surface-container-lowest px-6 py-3.5 sm:px-8">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    {remainingForFreeShipping === 0 ? (
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        <Check size={14} strokeWidth={2.5} />
                        Complimentary delivery unlocked!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <Truck size={14} className="text-primary" />
                        Add{" "}
                        <strong className="font-semibold text-on-surface">
                          {formatCurrency(remainingForFreeShipping)}
                        </strong>{" "}
                        for free express shipping
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {shippingProgress}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full transition-colors ${
                      remainingForFreeShipping === 0
                        ? "bg-emerald-600"
                        : "bg-primary"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Scrollable Item List */}
            <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
                  <span
                    className="material-symbols-outlined text-6xl text-outline-variant"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                  >
                    shopping_bag
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-medium tracking-widest text-on-surface-variant uppercase">
                      Your bag is empty
                    </p>
                    <p className="text-xs text-on-surface-variant/60 lowercase italic">
                      Quality takes time. Start curate yours.
                    </p>
                  </div>
                  <Button variant="primary" onClick={() => toggleDrawer(false)}>
                    Start Exploring
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id || item.variantId || `cart-item-${index}`}
                      layout
                      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="group flex gap-6"
                    >
                      <div className="relative flex h-[100px] w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface-container-low dark:bg-stone-900">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-zinc-400 dark:text-stone-600">
                            checkroom
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="max-w-[180px] truncate text-sm font-medium text-on-surface dark:text-stone-50">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-[10px] tracking-wider text-on-surface-variant uppercase">
                              {item.color} / {item.size}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="none"
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-outline-variant transition-colors hover:text-error"
                            icon={
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            }
                          />
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="flex items-center gap-4 rounded-full bg-surface-container-low px-3 py-1.5 dark:bg-stone-900">
                            <Button
                              variant="none"
                              size="none"
                              onClick={() => {
                                const newQty = Math.max(1, item.quantity - 1);
                                if (newQty !== item.quantity) {
                                  updateQuantity(item.id, newQty);
                                }
                              }}
                              className="flex h-6 w-6 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface dark:hover:text-stone-50"
                              icon={
                                <span className="material-symbols-outlined text-xs">
                                  remove
                                </span>
                              }
                            />
                            <span className="w-8 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="none"
                              size="none"
                              onClick={() => {
                                const newQty = item.quantity + 1;
                                updateQuantity(item.id, newQty);
                              }}
                              className="flex h-6 w-6 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface dark:hover:text-stone-50"
                              icon={
                                <span className="material-symbols-outlined text-xs">
                                  add
                                </span>
                              }
                            />
                          </div>
                          <span className="text-sm font-medium text-on-surface dark:text-stone-50">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer Section */}
            {items.length > 0 && (
              <div className="space-y-6 bg-surface-container-low p-8 dark:bg-stone-900">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                    Subtotal
                  </span>
                  <span className="text-2xl font-medium tracking-tight text-on-surface dark:text-stone-50">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <p className="text-center text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href="/cart"
                    onClick={() => toggleDrawer(false)}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full scale-100">
                      View Cart
                    </Button>
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => toggleDrawer(false)}
                    className="w-full"
                  >
                    <Button variant="primary" className="w-full scale-100">
                      Checkout Now
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
