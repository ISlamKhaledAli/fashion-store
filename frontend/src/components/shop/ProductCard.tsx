"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Heart, Plus } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { wishlistApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

interface ProductCardProps {
  product: Product;
  className?: string;
  delay?: number;
  variant?: "default" | "editorial";
  isListView?: boolean;
}

export const ProductCard = ({ product, className, delay = 0, variant = "default", isListView = false }: ProductCardProps) => {
  const { addItem, toggleDrawer } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const router = useRouter();
  
  const isFavorite = isInWishlist(product.id);

  // ... (maintain handleAddToCart, toggleFavorite, renderStars logic)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) return;
    addItem({
      id: `${product.id}-${defaultVariant.id}`,
      productId: product.id,
      variantId: defaultVariant.id,
      name: product.name,
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || "",
      price: product.price,
      size: defaultVariant.size,
      color: defaultVariant.color,
      quantity: 1,
      stock: defaultVariant.stock,
    });
    toggleDrawer(true);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { 
      router.push('/login'); 
      return; 
    }
  
    try {
      if (isFavorite) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const renderStars = (rating: number = 0, count: number = 0) => {
    const fullStars = Math.floor(rating) || 5; 
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={10} 
            className={cn(
              "transition-all duration-300",
              i < fullStars ? "fill-primary text-primary" : "text-outline-variant"
            )}
            strokeWidth={1.5}
          />
        ))}
        <span className="text-[10px] text-on-surface-variant ml-1">
          ({count})
        </span>
      </div>
    );
  };

  if (isListView) {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
        className={cn("group flex flex-col sm:flex-row gap-8 items-center bg-surface p-4 sm:p-0 border-b border-outline-variant/10 pb-12 sm:border-none sm:pb-0", className)}
      >
        <Link href={`/products/${product.slug}`} className="shrink-0 w-full sm:w-64 aspect-3/4 sm:aspect-square relative overflow-hidden bg-surface-container-low group-hover:-translate-y-1 transition-transform duration-500">
          {product.images[0] && (
            <Image
              src={product.images.find(img => img.isMain)?.url || product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <Button
            variant="icon"
            size="icon"
            onClick={toggleFavorite}
            isActive={isFavorite}
            className={cn(
              "absolute top-4 right-4 z-10 backdrop-blur-md rounded-full transition-all duration-300 group/fav",
              isFavorite ? "bg-black text-white!" : "bg-black/40 text-white! hover:bg-black"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              size={18} 
              className={cn(
                "transition-all duration-300",
                isFavorite ? "fill-white!" : "group-hover/fav:fill-white!"
              )} 
            />
          </Button>
        </Link>

        <div className="flex-1 space-y-4 py-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-bold">
              {product.brand?.name || "THE CURATOR"}
            </p>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight group-hover:text-primary transition-colors">
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>

          <p className="text-sm text-on-surface-variant line-clamp-2 max-w-xl leading-relaxed">
            {product.description || "Experimental design meets sustainable craftsmanship in this signature piece from our latest collection."}
          </p>

          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tighter">{formatCurrency(product.price)}</span>
            <div className="h-4 w-px bg-outline-variant" />
            {renderStars(product.avgRating, product.reviewCount)}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            {product.variants?.[0] && (
              <Button 
                onClick={handleAddToCart}
                className="px-8 py-3 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
              >
                Add to Collection
              </Button>
            )}
            <Link 
              href={`/products/${product.slug}`}
              className="px-8 py-3 border border-outline text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === "editorial") {
    return (
      <article
        className={cn("group cinematic-reveal", className)}
        style={{ animationDelay: `${delay}s` }}
      >
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative overflow-hidden aspect-3/4 bg-surface-container-low mb-6">
            {product.images[0] && (
              <Image
                src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            
            <Button
              variant="icon"
              size="icon"
              onClick={toggleFavorite}
              isActive={isFavorite}
              className={cn(
                "absolute top-4 right-4 z-10 backdrop-blur-md rounded-full transition-all duration-300 group/fav",
                isFavorite ? "bg-black text-white!" : "bg-black/40 text-white! hover:bg-black"
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              icon={
                <Heart 
                  size={20} 
                  className={cn(
                    "transition-all duration-300",
                    isFavorite ? "fill-white!" : "group-hover/fav:fill-white!"
                  )}
                  strokeWidth={1.5}
                />
              }
            />
            
            {product.variants?.[0] && (
              <Button
                variant="primary"
                onClick={handleAddToCart}
                className="absolute bottom-0 left-0 w-full py-6 translate-y-full group-hover:translate-y-0 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
                size="none"
              >
                Quick Add
              </Button>
            )}
          </div>
          
          <div className="space-y-1 mt-6">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              {product.brand?.name || "THE CURATOR"}
            </p>
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
              <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
            </div>
            {renderStars(product.avgRating, product.reviewCount)}
          </div>
        </Link>
      </article>
    );
  }

  // Default Variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay }}
      className={cn("group", className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-4/5 bg-surface-container-low overflow-hidden mb-6 cinematic-ease duration-500 group-hover:-translate-y-2">
          {product.images[0] && (
            <Image
              src={product.images.find(img => img.isMain)?.url || product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover cinematic-ease duration-[0.8s] group-hover:scale-110"
            />
          )}
          
          {product.variants?.[0] && (
            <Button
              variant="primary"
              size="icon"
              onClick={handleAddToCart}
              className="absolute bottom-6 right-6 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 shadow-xl cursor-pointer"
              aria-label="Add to cart"
              icon={<Plus size={24} strokeWidth={1.5} />}
            />
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-medium text-on-surface">{product.name}</h4>
            <p className="text-on-surface-variant text-sm mt-1">
              {product.variants?.[0]?.color || "Default"}
            </p>
          </div>
          <span className="text-lg font-bold tracking-tighter text-on-surface">
            {formatCurrency(product.price)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
