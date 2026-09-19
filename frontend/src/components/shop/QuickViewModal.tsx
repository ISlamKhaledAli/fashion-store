"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { flyToCart } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addItem, toggleDrawer } = useCartStore();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Derive unique colors
  const colors = useMemo(() => {
    if (!product?.variants) return [];
    const seen = new Set<string>();
    return product.variants.filter((v) => {
      const c = v.color?.toLowerCase();
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
  }, [product]);

  // Active color
  const activeColor = selectedColor || colors[0]?.color || "";

  // Derive sizes for active color
  const availableVariants = useMemo(() => {
    if (!product?.variants) return [];
    return product.variants.filter(
      (v) =>
        !activeColor || v.color?.toLowerCase() === activeColor.toLowerCase()
    );
  }, [product, activeColor]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!availableVariants.length) return null;
    if (selectedSize) {
      return (
        availableVariants.find((v) => v.size === selectedSize) ||
        availableVariants[0]
      );
    }
    return availableVariants[0];
  }, [availableVariants, selectedSize]);

  // Images for display
  const images = useMemo(() => {
    if (!product?.images?.length) return [];
    // If color is selected, sort color images first
    if (activeColor) {
      return [...product.images].sort((a, b) => {
        const aMatches =
          a.variantColor?.toLowerCase() === activeColor.toLowerCase();
        const bMatches =
          b.variantColor?.toLowerCase() === activeColor.toLowerCase();
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }
    return product.images;
  }, [product, activeColor]);

  const activeImage = images[activeImageIndex] || images[0];

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      toast.error("Please select a size first");
      return;
    }

    try {
      setIsAdding(true);
      await addItem({
        id: "",
        cartItemId: "",
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        image: activeImage?.url || "",
        price: product.price,
        size: selectedVariant.size,
        color: selectedVariant.color,
        quantity: 1,
        stock: selectedVariant.stock || 10,
      });

      flyToCart(imageRef);
      toast.success(`${product.name} added to your collection`);

      setTimeout(() => {
        setIsAdding(false);
        onClose();
        toggleDrawer(true);
      }, 600);
    } catch (err) {
      console.error("Quick view add to cart error:", err);
      setIsAdding(false);
      toast.error("Failed to add to cart");
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      className="overflow-hidden bg-surface p-0"
    >
      <div className="grid max-h-[85vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
        {/* Left: Product Media Gallery */}
        <div className="relative flex flex-col justify-between bg-surface-container-low p-6">
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-surface">
            {activeImage?.url ? (
              <Image
                ref={imageRef}
                src={activeImage.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400">
                No Image
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.slice(0, 4).map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all ${
                    activeImageIndex === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-outline-variant/30 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Selection */}
        <div className="flex flex-col justify-between space-y-6 p-6 sm:p-8">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase">
                {product.brand?.name || "THE CURATOR"}
              </span>
              <h3 className="mt-1 text-2xl font-medium tracking-tight text-on-surface">
                {product.name}
              </h3>
              <p className="mt-2 text-xl font-bold tracking-tight text-on-surface">
                {formatCurrency(product.price)}
              </p>
            </div>

            <p className="line-clamp-3 text-xs leading-relaxed text-on-surface-variant">
              {product.description ||
                "Architectural tailoring and archival textile craftsmanship. Designed to transcend seasonal trend cycles."}
            </p>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="pt-2">
                <label className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Color:{" "}
                  <span className="font-normal text-on-surface">
                    {activeColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(v.color);
                        setSelectedSize(null);
                        setActiveImageIndex(0);
                      }}
                      className={`h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-all ${
                        activeColor.toLowerCase() === v.color?.toLowerCase()
                          ? "border-primary bg-primary text-on-primary shadow-xs"
                          : "border-outline-variant/40 bg-surface text-on-surface hover:border-outline"
                      }`}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableVariants.length > 0 && (
              <div className="pt-2">
                <label className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Size:{" "}
                  <span className="font-normal text-on-surface">
                    {selectedVariant?.size || "Select Size"}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableVariants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const inStock = (v.stock || 0) > 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!inStock}
                        onClick={() => setSelectedSize(v.size)}
                        className={`h-9 min-w-10 cursor-pointer rounded-lg border px-3 text-xs font-semibold uppercase transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-on-primary"
                            : inStock
                              ? "border-outline-variant/40 bg-surface text-on-surface hover:border-primary"
                              : "cursor-not-allowed border-outline-variant/20 bg-surface-container-low text-on-surface-variant/40 line-through"
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 border-t border-outline-variant/15 pt-4">
            <Button
              variant="primary"
              onClick={handleAddToCart}
              disabled={isAdding || !selectedVariant}
              className="w-full py-3.5 text-xs font-semibold tracking-[0.2em] uppercase"
            >
              {isAdding ? "Adding to Bag..." : "Add to Bag"}
            </Button>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="group flex items-center justify-center gap-1.5 py-2 text-xs font-semibold tracking-wider text-on-surface-variant uppercase transition-colors hover:text-primary"
            >
              <span>View Full Editorial & Size Guide</span>
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
