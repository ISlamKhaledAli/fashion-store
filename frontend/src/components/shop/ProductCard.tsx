import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Plus, Check } from "lucide-react";
import { Product } from "@/types";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { flyToCart } from "@/lib/animations";
import { RatingDisplay } from "../ui/RatingDisplay";


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
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const isAnimating = useRef(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // State for color interactions
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const selectedVariant = useMemo(() => {
    const activeColor = selectedColor || hoveredColor;
    if (activeColor) {
      return product.variants?.find(v => v.color?.toLowerCase() === activeColor.toLowerCase()) || product.variants?.[0];
    }
    return product.variants?.[0];
  }, [product.variants, selectedColor, hoveredColor]);

  // Get unique colors from product variants
  const uniqueColors = useMemo(() => {
    const seen = new Set();
    return (product.variants || []).filter(v => {
      const key = v.color?.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [product.variants]);

  // Get image based on hover or selection
  const currentImage = useMemo(() => {
    const colorToDisplay = hoveredColor || selectedColor;
    
    if (!colorToDisplay) {
      return product.images?.find(img => img.isMain) || product.images?.[0];
    }
    
    const colorImage = product.images?.find(
      img => img.variantColor?.toLowerCase() === colorToDisplay.toLowerCase()
    );
    
    return colorImage || product.images?.find(img => img.isMain) || product.images?.[0];
  }, [hoveredColor, selectedColor, product.images]);
  
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAnimating.current) return;
    isAnimating.current = true;

    if (!selectedVariant) return;
    
    const start = Date.now();
    setStatus("loading");
    
    await addItem({
      id: '', // Server handles IDs
      cartItemId: '',
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: currentImage?.url || "",
      price: product.price,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity: 1,
      stock: selectedVariant.stock || 10,
    });
    
    // Ensure minimum 600ms loading state
    const elapsed = Date.now() - start;
    if (elapsed < 600) {
      await new Promise(r => setTimeout(r, 600 - elapsed));
    }
    
    
    setStatus("success");
    flyToCart(imageRef);
    
    setTimeout(() => {
      toggleDrawer(true);
      setStatus("idle");
      isAnimating.current = false;
    }, 800);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      console.error('Wishlist error:', err);
    }
  };

  // Removed renderStars in favor of RatingDisplay

  if (isListView) {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
        className={cn("group flex flex-col sm:flex-row gap-8 items-center bg-surface p-4 sm:p-0 border-b border-outline-variant/10 pb-12 sm:border-none sm:pb-0", className)}
      >
        <Link 
          href={`/products/${product.slug}${(hoveredColor || selectedColor) ? `?color=${encodeURIComponent((hoveredColor || selectedColor) as string)}` : ''}`} 
          className="shrink-0 w-full sm:w-64 aspect-3/4 sm:aspect-square relative overflow-hidden bg-surface-container-low group-hover:-translate-y-1 transition-transform duration-500"
        >
          {product.images[0] && (
            <Image
              ref={imageRef}
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
              <Link href={`/products/${product.slug}${(hoveredColor || selectedColor) ? `?color=${encodeURIComponent((hoveredColor || selectedColor) as string)}` : ''}`}>{product.name}</Link>
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 uppercase tracking-widest font-medium">
              {hoveredColor || product.variants?.[0]?.color || ""}
            </p>
          </div>

          <p className="text-sm text-on-surface-variant line-clamp-2 max-w-xl leading-relaxed">
            {product.description || "Experimental design meets sustainable craftsmanship in this signature piece from our latest collection."}
          </p>

          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tighter">{formatCurrency(product.price)}</span>
            <div className="h-4 w-px bg-outline-variant" />
            <RatingDisplay rating={product.avgRating} count={product.reviewCount} />
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            {product.variants?.[0] && (
              <Button 
                variant={status === "success" ? "success" : "primary"}
                onClick={handleAddToCart}
                disabled={status !== "idle"}
                className="px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg cursor-pointer min-w-[160px]"
              >
                <AnimatePresence mode="wait">
                  {status === "idle" && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Add to Collection
                    </motion.span>
                  )}
                  {status === "loading" && (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center font-bold"
                    >
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </motion.span>
                  )}
                  {status === "success" && (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} /> Added
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
            <Link 
              href={`/products/${product.slug}${(hoveredColor || selectedColor) ? `?color=${encodeURIComponent((hoveredColor || selectedColor) as string)}` : ''}`}
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
        <Link href={`/products/${product.slug}${(hoveredColor || selectedColor) ? `?color=${encodeURIComponent((hoveredColor || selectedColor) as string)}` : ''}`} className="block">
          <div className="relative overflow-hidden aspect-3/4 bg-surface-container-low mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage?.url || 'placeholder'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {currentImage ? (
                  <Image
                    ref={imageRef}
                    src={currentImage.url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100" />
                )}
              </motion.div>
            </AnimatePresence>
            
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
                variant={status === "success" ? "success" : "primary"}
                onClick={handleAddToCart}
                disabled={status !== "idle"}
                className="absolute bottom-0 left-0 w-full py-6 translate-y-full group-hover:translate-y-0 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
                size="none"
              >
                <AnimatePresence mode="wait">
                  {status === "idle" && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Quick Add
                    </motion.span>
                  )}
                  {status === "loading" && (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </motion.span>
                  )}
                  {status === "success" && (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={18} /> Added
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </div>
          
          {/* Premium Metadata */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant font-black">
              {product.brand?.name || "THE CURATOR"}
            </p>
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
              <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
            </div>
            
            {/* Color Swatches */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-[10px] pt-2">
                {uniqueColors.map(v => (
                  <motion.button
                    key={v.color}
                    type="button"
                    onMouseEnter={() => setHoveredColor(v.color)}
                    onMouseLeave={() => setHoveredColor(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(prev => prev === v.color ? null : v.color);
                    }}
                    whileHover={{ scale: 1.2 }}
                    animate={{ scale: selectedColor === v.color ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "w-[22px] h-[22px] rounded-full transition-all duration-300 flex items-center justify-center",
                      (hoveredColor === v.color || selectedColor === v.color)
                        ? "ring-2 ring-zinc-950 ring-offset-2"
                        : "ring-1 ring-transparent"
                    )}
                    title={v.color}
                    aria-label={`Select ${v.color}`}
                  >
                    <span 
                      className="block w-full h-full rounded-full border border-zinc-200"
                      style={{ backgroundColor: v.colorHex || '#ccc' }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
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
      <Link href={`/products/${product.slug}${(hoveredColor || selectedColor) ? `?color=${encodeURIComponent((hoveredColor || selectedColor) as string)}` : ''}`} className="block">
        <div className="relative aspect-4/5 bg-surface-container-low overflow-hidden mb-6 cinematic-ease duration-500 group-hover:-translate-y-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage?.url || 'placeholder'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {currentImage ? (
                <Image
                  ref={imageRef}
                  src={currentImage.url}
                  alt={product.name}
                  fill
                  className="object-cover cinematic-ease duration-[0.8s] group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-zinc-100" />
              )}
            </motion.div>
          </AnimatePresence>
          
          {product.variants?.[0] && (
            <Button
              variant={status === "success" ? "success" : "primary"}
              size="icon"
              onClick={handleAddToCart}
              disabled={status !== "idle"}
              className="absolute bottom-6 right-6 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 shadow-xl cursor-pointer"
              aria-label="Add to cart"
            >
              <AnimatePresence mode="wait">
                {status === "idle" && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Plus size={24} strokeWidth={1.5} />
                  </motion.span>
                )}
                {status === "loading" && (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </motion.span>
                )}
                {status === "success" && (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Check size={24} />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          {/* Brand & Price Header */}
          <div className="flex justify-between items-end">
            <p className="text-[9px] uppercase tracking-[0.25em] text-on-surface-variant font-black">
              {product.brand?.name || "THE CURATOR"}
            </p>
            <span className="text-sm font-bold tracking-tighter text-on-surface">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Title & Color Display */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-on-surface tracking-tight group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h4>
            
            {/* High-end Color Swatches */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-[10px]">
                {uniqueColors.map(variant => (
                  <motion.button
                    key={variant.color}
                    type="button"
                    onMouseEnter={() => setHoveredColor(variant.color)}
                    onMouseLeave={() => setHoveredColor(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(prev => prev === variant.color ? null : variant.color);
                    }}
                    whileHover={{ scale: 1.2 }}
                    animate={{ scale: selectedColor === variant.color ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "relative w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-300",
                      (hoveredColor === variant.color || selectedColor === variant.color)
                        ? "ring-2 ring-zinc-950 ring-offset-2" 
                        : "ring-1 ring-transparent"
                    )}
                    title={variant.color}
                    aria-label={`Select ${variant.color}`}
                  >
                    <span 
                      className="w-full h-full rounded-full border border-zinc-200"
                      style={{ backgroundColor: variant.colorHex || '#ccc' }}
                    />
                  </motion.button>
                ))}
                
                {/* Active Color Label (Optional but adds premium feel) */}
                <AnimatePresence>
                  {(hoveredColor || selectedColor) && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold ml-auto"
                    >
                      {hoveredColor || selectedColor}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
