"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const CartDrawer = () => {
  const { 
    items, 
    isOpen, 
    toggleDrawer, 
    removeItem, 
    updateQuantity, 
    getTotalPrice 
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

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
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-[55] transition-opacity duration-700"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              type: "tween",
              duration: 0.35, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="fixed right-0 h-full w-full max-w-[450px] z-[60] bg-surface dark:bg-stone-950 shadow-[0_20px_50px_rgba(26,28,29,0.05)] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-outline-variant/10">
              <div>
                <h2 className="text-lg font-bold text-on-surface dark:text-stone-50">
                  Your Bag ({items.length})
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                  Review your curated selection
                </p>
              </div>
              <Button 
                variant="icon"
                size="none"
                onClick={() => toggleDrawer(false)}
                className="p-2 hover:bg-surface-container-low dark:hover:bg-stone-900 rounded-full transition-colors group flex items-center justify-center h-10 w-10 shrink-0"
                icon={
                  <span className="material-symbols-outlined text-on-surface dark:text-stone-50 group-hover:rotate-90 transition-transform duration-500">
                    close
                  </span>
                }
              />
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <span className="material-symbols-outlined text-6xl text-outline-variant" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                    shopping_bag
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-on-surface-variant uppercase tracking-widest">Your bag is empty</p>
                    <p className="text-xs text-on-surface-variant/60 lowercase italic">Quality takes time. Start curate yours.</p>
                  </div>
                  <Button 
                    variant="primary"
                    onClick={() => toggleDrawer(false)}
                  >
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
                      className="flex gap-6 group"
                    >
                      <div className="w-20 h-[100px] flex-shrink-0 bg-surface-container-low dark:bg-stone-900 overflow-hidden rounded-sm relative">
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-on-surface dark:text-stone-50 truncate max-w-[180px]">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">
                              {item.color} / {item.size}
                            </p>
                          </div>
                          <Button 
                            variant="ghost"
                            size="none"
                            onClick={() => removeItem(item.id)}
                            className="text-outline-variant hover:text-error transition-colors p-2"
                            icon={
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            }
                          />
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-4 bg-surface-container-low dark:bg-stone-900 px-3 py-1.5 rounded-full">
                            <Button 
                              variant="none"
                              size="none"
                              onClick={() => {
                                const newQty = Math.max(1, item.quantity - 1);
                                if (newQty !== item.quantity) {
                                  updateQuantity(item.id, newQty);
                                }
                              }}
                              className="text-on-surface-variant hover:text-on-surface dark:hover:text-stone-50 transition-colors flex items-center justify-center h-6 w-6"
                              icon={
                                <span className="material-symbols-outlined text-xs">remove</span>
                              }
                            />
                            <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="none"
                              size="none"
                              onClick={() => {
                                const newQty = item.quantity + 1;
                                updateQuantity(item.id, newQty);
                              }}
                              className="text-on-surface-variant hover:text-on-surface dark:hover:text-stone-50 transition-colors flex items-center justify-center h-6 w-6"
                              icon={
                                <span className="material-symbols-outlined text-xs">add</span>
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
              <div className="p-8 bg-surface-container-low dark:bg-stone-900 space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Subtotal</span>
                  <span className="text-2xl font-medium tracking-tight text-on-surface dark:text-stone-50">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Link 
                    href="/cart" 
                    onClick={() => toggleDrawer(false)}
                    className="w-full"
                  >
                    <Button 
                      variant="outline"
                      className="w-full scale-100"
                    >
                      View Cart
                    </Button>
                  </Link>
                  <Link 
                    href="/checkout" 
                    onClick={() => toggleDrawer(false)}
                    className="w-full"
                  >
                    <Button 
                      variant="primary"
                      className="w-full scale-100"
                    >
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

