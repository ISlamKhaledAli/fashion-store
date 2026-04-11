"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Star, Minus, Plus, Heart, Truck, CreditCard, Apple, Smartphone } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addItem, toggleDrawer } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.variants?.[0]?.size || "");
  const [selectedColor, setSelectedColor] = useState<string>(product.variants?.[0]?.color || "");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Filter variants based on color
  const colorVariants = Array.from(new Set(product.variants.map(v => v.color)));
  // Filter sizes based on selected color
  const availableSizes = product.variants
    .filter(v => v.color === selectedColor)
    .map(v => v.size);

  const currentVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  const handleAddToCart = () => {
    if (!currentVariant) return;

    addItem({
      id: `${product.id}-${currentVariant.id}`,
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || "",
      price: product.price,
      size: currentVariant.size,
      color: currentVariant.color,
      quantity,
      stock: currentVariant.stock,
    });
    toggleDrawer(true);
  };

  return (
    <div className="sticky top-32 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-on-surface-variant font-medium">
          {product.brand?.name || "ESSENTIALS COLLECTION"}
        </p>
        <h1 className="text-[32px] md:text-[40px] font-medium leading-tight text-on-surface tracking-tight">
          {product.name}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 text-primary">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14}
                className={cn(
                  "transition-all",
                  i < Math.floor(product.avgRating || 4.5) ? "fill-primary text-primary" : "text-outline-variant"
                )}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">
            {product.reviewCount || 128} Reviews
          </span>
        </div>
      </div>

      <div className="text-3xl font-bold text-on-surface tracking-tighter">
        {formatCurrency(product.price)}
      </div>

      {/* Color Selection */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold tracking-0.1em uppercase text-on-surface-variant">
          Color <span className="text-on-surface ml-2">/ {selectedColor}</span>
        </p>
        <div className="flex gap-4">
          {colorVariants.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                // Reset size if current selection not available in new color
                const sizesForColor = product.variants.filter(v => v.color === color).map(v => v.size);
                if (!sizesForColor.includes(selectedSize)) {
                  setSelectedSize(sizesForColor[0]);
                }
              }}
              className={cn(
                "w-8 h-8 rounded-full border transition-all duration-300",
                selectedColor === color 
                  ? "border-primary ring-2 ring-surface ring-offset-0 scale-110" 
                  : "border-outline-variant hover:scale-110 hover:border-primary"
              )}
              style={{ backgroundColor: color.toLowerCase() }} // Note: in real app use hex from variant
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-[11px] font-bold tracking-0.1em uppercase text-on-surface-variant">Size</p>
          <button className="text-[10px] font-bold uppercase tracking-widest underline text-on-surface-variant hover:text-primary transition-colors">
            Size Guide
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                selectedSize === size
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-on-surface border-outline-variant hover:border-primary"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity & CTA */}
      <div className="flex gap-4">
        <div className="flex items-center border border-outline-variant px-4 py-2 bg-white">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 hover:text-primary transition-colors flex items-center"
          >
            <Minus size={18} strokeWidth={1.5} />
          </button>
          <span className="mx-6 text-sm font-medium w-4 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="p-1 hover:text-primary transition-colors flex items-center"
          >
            <Plus size={18} strokeWidth={1.5} />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!currentVariant || currentVariant.stock === 0}
          className="flex-1 bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all duration-300 hover:scale-[0.98] active:scale-95 disabled:opacity-50"
        >
          {currentVariant && currentVariant.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className={cn(
            "p-4 border border-outline-variant transition-all hover:bg-surface-container flex items-center justify-center",
            isFavorite && "text-error"
          )}
        >
          <Heart 
            size={20} 
            className={cn(
              "transition-all",
              isFavorite && "fill-current"
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Shipping Info */}
      <div className="pt-8 border-t border-surface-container space-y-6">
        <div className="flex items-start gap-4">
          <Truck className="text-on-surface-variant" size={20} strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium">Carbon-Neutral Shipping</p>
            <p className="text-xs text-on-surface-variant">Complimentary delivery on all orders over $500.</p>
          </div>
        </div>
        
        <div className="flex gap-6 items-center opacity-40 grayscale hover:opacity-100 transition-all duration-500">
          <CreditCard size={24} strokeWidth={1.5} />
          <Apple size={24} strokeWidth={1.5} />
          <Smartphone size={24} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};
