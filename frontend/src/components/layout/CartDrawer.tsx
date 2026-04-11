"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export const CartDrawer = () => {
  const { 
    items, 
    isOpen, 
    toggleDrawer, 
    removeItem, 
    updateQuantity, 
    getTotalPrice 
  } = useCartStore();

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
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] z-[70] bg-surface-container-lowest shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-outline-variant/10">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Your Bag ({items.length})</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                  Review your curated selection
                </p>
              </div>
              <button
                onClick={() => toggleDrawer(false)}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors group"
              >
                <span className="material-symbols-outlined text-on-surface group-hover:rotate-90 transition-transform duration-500">
                  close
                </span>
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-outline-variant">
                    shopping_bag
                  </span>
                  <p className="text-sm font-medium text-on-surface-variant">Your bag is empty</p>
                  <Button variant="outline" size="sm" onClick={() => toggleDrawer(false)}>
                    Start Exploring
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-6 group"
                  >
                    <div className="relative w-24 h-32 flex-shrink-0 bg-surface-container-low overflow-hidden rounded-sm">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-on-surface">{item.name}</h3>
                          <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">
                            {item.color} / {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-outline hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4 bg-surface-container-low px-3 py-1.5 rounded-full">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">remove</span>
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">add</span>
                          </button>
                        </div>
                        <span className="text-sm font-bold text-on-surface">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 bg-surface-container-low space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Subtotal
                  </span>
                  <span className="text-2xl font-bold tracking-tighter text-on-surface">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="w-full" onClick={() => toggleDrawer(false)}>
                    Continue Shopping
                  </Button>
                  <Link href="/checkout" onClick={() => toggleDrawer(false)}>
                    <Button variant="primary" className="w-full">
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
