"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { productApi } from "@/lib/api";
import { Button } from "../ui/Button";

interface ProductInfoProps {
  product: Product;
}

const COLOR_MAP: Record<string, string> = {
  "Charcoal": "#1A1C1D",
  "Grey": "#3D3E42",
  "Silver": "#E5E5E5",
  "Black": "#000000",
  "White": "#FFFFFF",
  "Navy": "#000080",
};

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
  const [isFavorite, setIsFavorite] = useState(false);

  const availableSizes = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  const handleAddToCart = async () => {
    if (!currentVariant) return;

    setButtonState("loading");
    await new Promise((resolve) => setTimeout(resolve, 800));

    addItem({
      id: `${product.id}-${currentVariant.id}`,
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

    setButtonState("success");

    setTimeout(() => {
      setButtonState("idle");
      toggleDrawer(true);
    }, 2000);
  };

  const toggleWishlist = async () => {
    setIsFavorite(!isFavorite);
    try {
      if (!isFavorite) {
        await productApi.addToWishlist(product.id);
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
        <div className="flex items-center gap-3 mt-3">
          <div className="flex text-primary">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className="material-symbols-outlined text-sm" 
                style={{ fontVariationSettings: `'FILL' ${i < Math.floor(product.avgRating) ? 1 : 0}` }}
              >
                star
              </span>
            ))}
          </div>
          <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
            {product.reviewCount} Reviews
          </span>
        </div>
      </div>

      <div className="text-[28px] font-bold text-on-surface">
        {formatCurrency(product.price)}
      </div>

      <div className="space-y-4">
        <p className="text-xs font-label tracking-widest uppercase">
          Color / <span className="text-primary">{selectedColor}</span>
        </p>
        <div className="flex gap-3">
          {colors.map((color) => (
            <Button
              key={color}
              variant="none"
              size="none"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-8 h-8 rounded-full border transition-all duration-300",
                selectedColor === color 
                  ? "border-primary ring-2 ring-surface ring-offset-0 scale-110" 
                  : "border-outline-variant hover:scale-110"
              )}
              style={{ backgroundColor: COLOR_MAP[color] || color.toLowerCase() }}
              title={color}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-label tracking-widest uppercase">Size</p>
          <Button 
            variant="ghost" 
            size="none" 
            className="text-xs underline text-on-surface-variant hover:text-primary"
          >
            Size Guide
          </Button>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2"
              >
                Add to Cart
              </motion.span>
            )}
            {buttonState === "success" && (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">check</span>
                Added
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
