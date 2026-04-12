"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { wishlistApi } from "@/lib/api";
import { WishlistItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await wishlistApi.getAll();
        if (res.data.success) {
          setItems(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, router]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await wishlistApi.remove(productId);
      if (res.data.success) {
        setItems(items.filter(item => item.productId !== productId));
      }
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const defaultVariant = item.product.variants[0];
    if (defaultVariant) {
      addItem({
        id: Math.random().toString(36).substr(2, 9),
        productId: item.productId,
        variantId: defaultVariant.id,
        name: item.product.name,
        image: item.product.images[0]?.url || "",
        price: item.product.price,
        size: defaultVariant.size,
        color: defaultVariant.color,
        quantity: 1,
        stock: defaultVariant.stock
      });
      // Optionally show a toast or feedback
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex bg-surface min-h-screen">
      <AccountSidebar />
      
      <main className="flex-1 px-16 py-12">
        <header className="mb-16">
          <h1 className="text-4xl font-medium text-on-surface tracking-tighter mb-4">
            My Wishlist {!loading && `(${items.length} items)`}
          </h1>
          <div className="h-px w-full bg-outline-variant opacity-15" />
        </header>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col"
                >
                  <button 
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-error hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                  
                  <div className="aspect-[3/4] overflow-hidden bg-surface-container-low mb-6 ring-1 ring-outline-variant/5">
                    <img 
                      src={item.product.images[0]?.url} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  </div>
                  
                  <div className="space-y-1 mb-6">
                    <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-on-surface-variant">AETERNA STUDIO</span>
                    <h3 className="text-lg font-medium tracking-tight text-on-surface">{item.product.name}</h3>
                    <p className="text-on-surface-variant text-sm font-medium">{formatCurrency(item.product.price)}</p>
                  </div>
                  
                  <Button 
                    variant="primary"
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-4 uppercase tracking-[0.2em] text-xs font-bold"
                  >
                    Add to Cart
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant">favorite</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Your wishlist is empty</h3>
              <p className="text-on-surface-variant max-w-xs mx-auto">
                Explore our collections and save your favorite pieces here.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/products")} className="px-10">
              Continue Shopping
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
