"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { productApi } from "@/lib/api";
import { Product, Variant } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, toggleDrawer } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productApi.getBySlug(slug as string);
        if (response.data.success) {
          const p = response.data.data;
          setProduct(p);
          setSelectedVariant(p.variants[0]);
          setActiveImage(p.images.find(img => img.isMain)?.url || p.images[0].url);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: activeImage,
      price: product.price,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantity,
      stock: selectedVariant.stock,
    });
    toggleDrawer(true);
  };

  if (isLoading) return <div className="pt-40 text-center uppercase tracking-widest text-xs">Loading Artifact...</div>;
  if (!product) return <div className="pt-40 text-center uppercase tracking-widest text-xs">Artifact Not Found</div>;

  return (
    <div className="pt-32 pb-32">
      {/* Above the Fold */}
      <section className="max-w-[1440px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/5] bg-surface-container-low overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                className="w-full h-full"
              >
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={cn(
                  "aspect-square bg-surface-container-low relative overflow-hidden cinematic-ease transition-all duration-500",
                  activeImage === img.url ? "ring-1 ring-primary" : "opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sticky Info Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-12">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-on-surface-variant mb-4 font-bold">
                {product.category?.name} Artifact
              </p>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-on-surface leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-bold tracking-tighter text-on-surface mt-6">
                {formatCurrency(product.price)}
              </p>
            </div>

            <p className="text-on-surface-variant text-base leading-relaxed max-w-md">
              {product.description}
            </p>

            {/* Selection */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-widest uppercase">Size</p>
                <div className="grid grid-cols-4 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                      className={cn(
                        "py-4 text-xs font-bold uppercase transition-all cinematic-ease",
                        selectedVariant?.id === v.id
                          ? "bg-primary text-on-primary"
                          : "border border-outline-variant/30 hover:border-primary text-on-surface-variant",
                        v.stock === 0 && "opacity-20 cursor-not-allowed line-through"
                      )}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center border border-outline-variant/30 px-6 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="mx-8 text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  Add to Bag
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Sections */}
      <section className="mt-32 border-t border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="sticky top-0 h-[80vh] bg-surface-container-high overflow-hidden hidden lg:block">
             <Image 
                src={product.images[1]?.url || activeImage}
                alt="Story"
                fill
                className="object-cover"
             />
          </div>
          <div className="py-32 px-8 lg:px-24 space-y-64">
             <div className="space-y-6">
                <span className="material-symbols-outlined text-4xl text-primary">eco</span>
                <h2 className="text-3xl font-medium tracking-tight">Sustainable Origin</h2>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  Every thread in this garment is traced back to ethical sources, 
                  maintaining natural resilience and unmatched texture.
                </p>
             </div>
             <div className="space-y-6">
                <span className="material-symbols-outlined text-4xl text-primary">architecture</span>
                <h2 className="text-3xl font-medium tracking-tight">Sculptural Fit</h2>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  Patterned with 3D anatomical accuracy to ensure movement is fluid 
                  and the silhouette remain sharp in any posture.
                </p>
             </div>
          </div>
        </div>
      </section>

      <FeaturedProducts />
    </div>
  );
}
