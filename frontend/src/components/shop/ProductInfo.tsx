"use client";

import React, { useState, useRef } from "react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { productApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { flyToCart } from "@/lib/animations";
import { toast } from "sonner";
import { RatingDisplay } from "../ui/RatingDisplay";

interface ProductInfoProps {
  product: Product;
}



type ButtonState = "idle" | "loading" | "success";

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addItem, toggleDrawer } = useCartStore();
  
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants?.[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const isAnimating = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const router = useRouter();
  
  const isFavorite = isInWishlist(product.id);

  const availableSizes = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!currentVariant || isAnimating.current) return;
    isAnimating.current = true;

    const start = Date.now();
    setButtonState("loading");
    
    await addItem({
      id: '', // Server handles IDs
      cartItemId: '',
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      image: product.images.find((img) => img.isMain)?.url || product.images[0]?.url || "",
      price: product.price,
      size: currentVariant.size,
      color: currentVariant.color,
      quantity,
      stock: currentVariant.stock,
    });

    // Ensure minimum 600ms loading state
    const elapsed = Date.now() - start;
    if (elapsed < 600) {
      await new Promise(r => setTimeout(r, 600 - elapsed));
    }

    setButtonState("success");
    
    // Trigger fly animation immediately
    const mainImg = document.getElementById('pdp-main-image');
    flyToCart(mainImg);

    setTimeout(() => {
      toggleDrawer(true);
      setButtonState("idle");
      isAnimating.current = false;
    }, 800);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your wishlist");
      return;
    }
    
    try {
      if (isFavorite) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div className="sticky top-32 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-on-surface-variant mb-2">
          {product.brand?.name || "ESSENTIALS COLLECTION"}
        </p>
        <h1 className="text-[32px] font-medium leading-tight text-on-surface">
          {product.name}
        </h1>
        <RatingDisplay rating={product.avgRating} count={product.reviewCount} size={14} className="mt-3" />
      </div>

      <div className="text-[28px] font-bold text-on-surface">
        {formatCurrency(product.price)}
      </div>

      <div className="space-y-4">
        <p className="text-xs font-label tracking-widest uppercase">
          Color / <span className="text-primary">{selectedColor}</span>
        </p>
        <div className="flex gap-3">
          {product.variants
            .filter((v, i, arr) => arr.findIndex(x => x.color === v.color) === i) // unique colors
            .map((variant) => (
              <Button
                variant="none"
                key={variant.color}
                onClick={() => setSelectedColor(variant.color)}
                style={{ backgroundColor: variant.colorHex || '#ccc' }}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all p-0",
                  selectedColor === variant.color 
                    ? 'border-zinc-950 scale-110' 
                    : 'border-transparent hover:border-zinc-200'
                )}
                title={variant.color}
                aria-label={`Select color ${variant.color}`}
              />
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-label tracking-widest uppercase">Size</p>
          <a 
            href="/size-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline text-on-surface-variant hover:text-primary transition-colors"
          >
            Size Guide
          </a>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map((size) => (
            <Button
              key={size}
              onClick={() => setSelectedSize(size)}
              variant={selectedSize === size ? "primary" : "outline"}
              size="none"
              className={cn(
                "py-3 text-sm border transition-all duration-200",
                selectedSize === size
                  ? "border-primary bg-primary text-white"
                  : "border-outline-variant hover:border-primary text-on-surface"
              )}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center border border-outline-variant bg-white">
          <Button 
            variant="ghost"
            size="none"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:text-primary transition-colors"
            aria-label="Decrease quantity"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </Button>
          <span className="mx-4 text-sm tabular-nums min-w-1.5rem text-center">{quantity}</span>
          <Button 
            variant="ghost"
            size="none"
            onClick={() => setQuantity(quantity + 1)}
            className="p-3 hover:text-primary transition-colors"
            aria-label="Increase quantity"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={buttonState !== "idle" || !currentVariant}
          className={cn(
            "flex-1 font-medium py-4 transition-all duration-300 relative overflow-hidden group disabled:opacity-70",
            buttonState === "success" ? "bg-green-600 text-white" : ""
          )}
          isLoading={buttonState === "loading"}
        >
          <AnimatePresence mode="wait">
            {buttonState === "idle" && (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-2"
              >
                Add to Cart
              </motion.span>
            )}
            {buttonState === "success" && (
              <motion.span
                key="success"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <motion.span 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="material-symbols-outlined text-xl"
                  >
                    check
                  </motion.span>
                  Added
                </div>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        <Button
          variant="none"
          size="none"
          onClick={toggleWishlist}
          className={cn(
            "p-4 border transition-colors flex items-center justify-center rounded-sm",
            isFavorite ? "border-red-100 bg-red-50 text-red-600" : "border-outline-variant hover:bg-surface-container text-on-surface"
          )}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          icon={
            <motion.span 
              animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
              className={cn(
                "material-symbols-outlined text-xl",
                isFavorite && "fill-current"
              )}
              style={{ fontVariationSettings: `'FILL' ${isFavorite ? 1 : 0}` }}
            >
              favorite
            </motion.span>
          }
        />
      </div>

      <div className="pt-8 border-t border-surface-container space-y-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant">local_shipping</span>
          <p className="text-sm text-on-surface-variant">Complimentary Carbon-Neutral Shipping</p>
        </div>
      </div>
    </div>
  );
};
