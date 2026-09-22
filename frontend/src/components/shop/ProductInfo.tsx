"use client";

import React, { useState, useRef } from "react";
import type { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "../ui/Button";
import { flyToCart } from "@/lib/animations";
import { toast } from "sonner";
import { RatingDisplay } from "../ui/RatingDisplay";
import { useChatStore } from "@/store/chatStore";
import { RentalSelector } from "./RentalSelector";

interface ProductInfoProps {
  product: Product;
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

type ButtonState = "idle" | "loading" | "success";

export const ProductInfo = ({
  product,
  selectedColor,
  onColorSelect,
}: ProductInfoProps) => {
  const { addItem, toggleDrawer } = useCartStore();

  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const isAnimating = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  const isFavorite = isInWishlist(product.id);
  const isRentOnly = Boolean(
    product.isRentable && product.isSaleable === false
  );
  const isBoth = Boolean(product.isRentable && product.isSaleable !== false);

  const [purchaseMode, setPurchaseMode] = useState<"BUY" | "RENT">(() => {
    return product.isRentable && product.isSaleable === false ? "RENT" : "BUY";
  });

  const availableSizes = product.variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.size);

  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const colorHasImages = (colorName: string) => {
    return product.images?.some(
      (img) => img.variantColor?.toLowerCase() === colorName.toLowerCase()
    );
  };

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!currentVariant || isAnimating.current) return;
    isAnimating.current = true;

    try {
      const start = Date.now();
      setButtonState("loading");

      await addItem({
        id: "", // Server handles IDs
        cartItemId: "",
        productId: product.id,
        variantId: currentVariant.id,
        name: product.name,
        image:
          product.images.find((img) => img.isMain)?.url ||
          product.images[0]?.url ||
          "",
        price: product.price,
        size: currentVariant.size,
        color: currentVariant.color,
        quantity,
        stock: currentVariant.stock,
      });

      // Ensure minimum 400ms loading state
      const elapsed = Date.now() - start;
      if (elapsed < 400) {
        await new Promise((r) => setTimeout(r, 400 - elapsed));
      }

      setButtonState("success");
      toggleDrawer(true);
      flyToCart(e?.currentTarget as HTMLElement);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to bag");
      setButtonState("idle");
    } finally {
      setTimeout(() => {
        setButtonState("idle");
        isAnimating.current = false;
      }, 1500);
    }
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
    <div className="animate-in fade-in slide-in-from-right-8 sticky top-32 space-y-8 duration-700">
      <div>
        <p className="mb-2 text-xs tracking-[0.2em] text-on-surface-variant uppercase">
          {product.brand?.name || "ESSENTIALS COLLECTION"}
        </p>
        <h1 className="text-[32px] leading-tight font-medium text-on-surface">
          {product.name}
        </h1>
        <RatingDisplay
          rating={product.avgRating}
          count={product.reviewCount}
          size={14}
          className="mt-3"
        />
      </div>

      {/* If Rent Only: show exclusive rental notice */}
      {isRentOnly && (
        <div className="flex items-center justify-between border border-outline-variant/60 bg-surface-container-low px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-label text-xs tracking-widest text-on-surface uppercase">
              Archival Rental Exclusive
            </span>
          </div>
          <span className="text-[11px] font-medium text-on-surface-variant">
            Available only for scheduled bookings
          </span>
        </div>
      )}

      {/* If Both: show mode switcher */}
      {isBoth && (
        <div className="flex border border-outline-variant bg-surface p-1">
          <button
            type="button"
            onClick={() => setPurchaseMode("BUY")}
            className={cn(
              "flex-1 py-2 font-label text-xs tracking-widest uppercase transition-all",
              purchaseMode === "BUY"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Buy To Own
          </button>
          <button
            type="button"
            onClick={() => setPurchaseMode("RENT")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2 font-label text-xs tracking-widest uppercase transition-all",
              purchaseMode === "RENT"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span>Rent &amp; Reserve</span>
            <span className="rounded-xs bg-surface-container-high px-1 py-0.5 text-[9px] text-on-surface">
              Rental
            </span>
          </button>
        </div>
      )}

      {purchaseMode === "BUY" && (
        <div className="text-[28px] font-bold text-on-surface">
          {formatCurrency(product.price)}
        </div>
      )}

      <div className="space-y-4">
        <p className="font-label text-xs tracking-widest uppercase">
          Color / <span className="text-primary">{selectedColor}</span>
        </p>
        <div className="flex gap-3">
          {product.variants
            .filter(
              (v, i, arr) => arr.findIndex((x) => x.color === v.color) === i
            ) // unique colors
            .map((variant) => (
              <Button
                variant="none"
                key={variant.color}
                onClick={() => onColorSelect(variant.color)}
                style={{ backgroundColor: variant.colorHex || "#ccc" }}
                className={cn(
                  "relative h-7 w-7 rounded-full border-2 p-0 transition-all",
                  selectedColor === variant.color
                    ? "scale-110 border-zinc-950"
                    : "border-transparent hover:border-zinc-200"
                )}
                title={variant.color}
                aria-label={`Select color ${variant.color}`}
              >
                {colorHasImages(variant.color) && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-zinc-900" />
                )}
              </Button>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-label text-xs tracking-widest uppercase">Size</p>
          <div className="flex gap-4">
            <Button
              variant="none"
              size="none"
              onClick={() =>
                useChatStore
                  .getState()
                  .triggerSizeAdvisor(product.id, product.name)
              }
              className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs font-medium text-primary underline transition-opacity outline-none hover:opacity-85"
            >
              <span className="material-symbols-outlined text-[14px]">
                auto_awesome
              </span>
              Find my size
            </Button>
            <a
              href="/size-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-on-surface-variant underline transition-colors hover:text-primary"
            >
              Size Guide
            </a>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map((size) => (
            <Button
              key={size}
              variant="none"
              size="none"
              onClick={() => setSelectedSize(size)}
              className={cn(
                "cursor-pointer border py-3 text-xs tracking-widest uppercase transition-all",
                selectedSize === size
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface text-on-surface hover:border-primary"
              )}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {purchaseMode === "RENT" ? (
        <RentalSelector product={product} selectedVariant={currentVariant} />
      ) : (
        <div className="flex gap-4">
          <div className="flex items-center border border-outline-variant bg-white">
            <Button
              variant="ghost"
              size="none"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 transition-colors hover:text-primary"
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </Button>
            <span className="min-w-1.5rem mx-4 text-center text-sm tabular-nums">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="none"
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 transition-colors hover:text-primary"
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={buttonState !== "idle" || !currentVariant}
            className={cn(
              "group relative flex-1 overflow-hidden py-4 font-medium transition-all duration-300 disabled:opacity-70",
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
              "flex items-center justify-center rounded-sm border p-4 transition-colors",
              isFavorite
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-outline-variant text-on-surface hover:bg-surface-container"
            )}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            icon={
              <motion.span
                animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
                className={cn(
                  "material-symbols-outlined text-xl",
                  isFavorite && "fill-current"
                )}
                style={{
                  fontVariationSettings: `'FILL' ${isFavorite ? 1 : 0}`,
                }}
              >
                favorite
              </motion.span>
            }
          />
        </div>
      )}

      <div className="space-y-4 border-t border-surface-container pt-8">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant">
            local_shipping
          </span>
          <p className="text-sm text-on-surface-variant">
            Complimentary Carbon-Neutral Shipping
          </p>
        </div>

        {product.pickupLocations && product.pickupLocations.length > 0 && (
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined mt-0.5 text-on-surface-variant">
              storefront
            </span>
            <div className="text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">
                Boutique Salon Pickup Available:
              </span>{" "}
              <span>{product.pickupLocations.join(", ")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
