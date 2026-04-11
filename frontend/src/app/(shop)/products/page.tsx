"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGridHeader } from "@/components/shop/ProductGridHeader";
import { productApi, categoryApi } from "@/lib/api";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/Button";

// Fallback products matching the HTML design exactly for the editorial list
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "ep-1",
    name: "Structured Wool Blazer",
    slug: "structured-wool-blazer",
    description: "Architectural wool blazer.",
    price: 580,
    featured: false,
    categoryId: "1",
    brandId: "1",
    avgRating: 5,
    reviewCount: 24,
    createdAt: new Date().toISOString(),
    images: [{ id: "i1", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCJQky2aF_BKNWCteeuiSm8OIUvNBcMY89b0218nwMr5E1hSUPfQxV9XpMVh1HuoDdsIkc9Flv9KqJt51OncSAmtjzC2iljSglM-2q1ogtedaauly5LEgXGB3mEq9o3rebgDOc99kPObQF078DRFXJY7rtliah8g1--pD4-sC4Ze92yHuPCfbfjIEt8HehhGIOau3y4jQrdNoRVSHubRKOf2zykZt0MAa_5d_f6KDaDa3dH6DJJTNfvRSS5MnwtkFeV8bzbhqQx1Q", publicId: "p1", isMain: true }],
    variants: [{ id: "v1", size: "M", color: "Black", stock: 10 }],
    brand: { id: "1", name: "L'ARTISAN DU NORD", slug: "l-artisan-du-nord" }
  },
  {
    id: "ep-2",
    name: "Raw Edge Silk Scarf",
    slug: "raw-edge-silk-scarf",
    description: "Premium charcoal grey silk scarf.",
    price: 225,
    featured: false,
    categoryId: "1",
    brandId: "2",
    avgRating: 4.5,
    reviewCount: 18,
    createdAt: new Date().toISOString(),
    images: [{ id: "i2", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_dUtT2ZFvFzwsxzx4uI_-GXrmU3LAb1EFZgbHDyLfjYJHZlnIzft8r44cjPheLBtiG0RsewrHM2kmWb6GOcciRg4pfYFHE4z9yuYGGv2AnBUlPKWeFBfk0OJUWvhOBtK3ieFIQC6-3Z9cMlq2fBZEU7cv6_OMtQWri-MHv4YtzKDcsdPc-t6Oq4exCkPBaas1e1uegvXjqUCuEK2xorIYstDyDaqvgBHdOWG4gcHmcuULvNkNL5usDirsPori_twgjNkPq7w6kIo", publicId: "p2", isMain: true }],
    variants: [{ id: "v2", size: "OS", color: "Charcoal", stock: 5 }],
    brand: { id: "2", name: "STUDIO NOIR", slug: "studio-noir" }
  },
  {
    id: "ep-3",
    name: "Calfskin Chelsea Boot",
    slug: "calfskin-chelsea-boot",
    description: "Black leather platform boots.",
    price: 890,
    featured: false,
    categoryId: "1",
    brandId: "3",
    avgRating: 5,
    reviewCount: 42,
    createdAt: new Date().toISOString(),
    images: [{ id: "i3", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxZB-mLC06ibciSWUyYjT0lBr7uQiO5awDYg5MJIfdDPW3Vqo087_6JmAP7UuLLTUyXh_hoseXYp_tlVpaxdzpG7-StS8FjRBBd5AKR_Nga-ydiqCoCC6IMCwgAtigmNdi7DmoxFTlKEdJEdKO47y__nBWHmrr4LJ9W_WU7CjUbAPA63EFFah-DnBfhJrkbOOh0ewh0bQH3q6CUD0Tr8QpLmcq-Cyf-GdDmD12fmHLYU7xdcCEHrnAX5mLeSOVA3Sb_j69ErZcFro", publicId: "p3", isMain: true }],
    variants: [{ id: "v3", size: "42", color: "Black", stock: 8 }],
    brand: { id: "3", name: "OBJECTS OF DESIRE", slug: "objects-of-desire" }
  },
  {
    id: "ep-4",
    name: "Oversized Linen Shirt",
    slug: "oversized-linen-shirt",
    description: "Minimalist beige linen shirt.",
    price: 340,
    featured: false,
    categoryId: "1",
    brandId: "4",
    avgRating: 4,
    reviewCount: 12,
    createdAt: new Date().toISOString(),
    images: [{ id: "i4", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEGJoHb5XGt7N4G7plcrpihMMfJwwzQ_6w9VqJsi2E8gfvGaNkGNMa9tOBLiUqv5wFJSkSolW6MYdLhN7V6cub-TFq7PyPQs9oqxDni7o74HBDt2QE8yXJlmKBDCatMQobu1YR25iA2-KV1NnGtb0b5XPdy9N3Sw3_32-bay4DZ0drb7zr1TOAkJH3rlJBh3lPNEoN9n1_dY6RiFlzoHCtU3UkWl0gJ6CbKDvGLPvNORpl1k0cl4PKv6uS01hdoYLAi1XM4MySIu8", publicId: "p4", isMain: true }],
    variants: [{ id: "v4", size: "L", color: "Beige", stock: 15 }],
    brand: { id: "4", name: "THE ARCHIVE", slug: "the-archive" }
  },
  {
    id: "ep-5",
    name: "Tan Suede Loafer",
    slug: "tan-suede-loafer",
    description: "High-end suede loafers.",
    price: 410,
    featured: false,
    categoryId: "1",
    brandId: "5",
    avgRating: 5,
    reviewCount: 31,
    createdAt: new Date().toISOString(),
    images: [{ id: "i5", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsZWKrGeDOWGjeN2Y9Q-PfSq5Pq-v-WB7u-HBl8Bvqv4gffi44ZDkNcLLs2eLaPdIn47vV38efwnPLWBc8nt0lCXmCAXZ2Ju0-EcdRvBFToxVs4nS3Fw_ilcpfpdq32NrifVUNs1K-zXSzoUFTOIOVdMw7yattO_xyQZsof8IjL1-UuMduKLrZRBFyMdPlNGL-omNbHMb2XJQ6x-T-EPsjlcotnkGKzlOB_TqoyZmY3EWeYevrSBcmj0ekeJoYd-RWjs9xwdTFaGU", publicId: "p5", isMain: true }],
    variants: [{ id: "v5", size: "43", color: "Tan", stock: 12 }],
    brand: { id: "5", name: "PÉDALEUR", slug: "pedaleur" }
  },
  {
    id: "ep-6",
    name: "Sculptural Leather Tote",
    slug: "sculptural-leather-tote",
    description: "Handcrafted leather tote bag.",
    price: 1200,
    featured: false,
    categoryId: "1",
    brandId: "6",
    avgRating: 4.5,
    reviewCount: 56,
    createdAt: new Date().toISOString(),
    images: [{ id: "i6", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuATRvT0aJAzjgTFSq375pxvOv9qEtUBrJwTMoAcDyioZVISU3HoQofeBD-oCCIRxlbcfZw6z0G9ca0KnAa2wy7aQWGmAKxAyw4bMRAysWMB2S813RlHjS9IPrkTKHgJDRdvzyAk6SsGx6Ag3nkco_mwNvf4BLwpCGb4kvzmAMkdfAV85Gkx4QsmXmPPHy3Zh0q4EYUhCN1xU77MiLiMYH3QLjYTU2UzRmmLeHJCngOPdfXuarrPrKUV9cTGoDMbq0MhuiLfPL_dS18", publicId: "p6", isMain: true }],
    variants: [{ id: "v6", size: "OS", color: "Brown", stock: 4 }],
    brand: { id: "6", name: "MATIÈRE PREMIÈRE", slug: "matiere-premiere" }
  }
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  
  const currentCategorySlug = searchParams.get("category");
  const currentCategory = categories.find(c => c.slug === currentCategorySlug);

  useEffect(() => {
    const fetchData = async () => {
      // In a real scenario we use the API, falling back to static 
      try {
        const catRes = await categoryApi.getAll();
        if (catRes.data.success && catRes.data.data.length > 0) {
          setCategories(catRes.data.data);
        }
        
        const prodRes = await productApi.getAll({ category: currentCategorySlug });
        if (prodRes.data.success && prodRes.data.data.length > 0) {
          setProducts(prodRes.data.data);
        }
      } catch (error) {
        // Fallback already populated
      }
    };

    fetchData();
  }, [currentCategorySlug]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <FilterSidebar />

      <section className="flex-1 p-8 lg:p-12">
        <ProductGridHeader 
          totalProducts={products.length}
          categoryName={currentCategory ? currentCategory.name : "Summer Editorial"}
          isGridView={isGridView}
          onViewChange={setIsGridView}
        />

        <div className={`grid gap-y-16 gap-x-8 ${isGridView ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-3/4 bg-surface-container-high animate-pulse" />
              ))
            ) : (
              products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  variant="editorial"
                  delay={index * 0.1}
                  className={!isGridView ? "md:flex gap-8 items-center" : ""}
                />
              ))
            )}
          </AnimatePresence>
        </div>
        
        {!isLoading && products.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <p className="text-on-surface-variant">No items found in this collection.</p>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        )}

        {products.length > 0 && (
          <footer className="mt-24 flex justify-center items-center gap-8 border-t border-outline-variant/20 pt-12">
            <button className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">west</span> Prev
            </button>
            <div className="flex items-center gap-6 text-xs font-bold tracking-widest">
              <span className="text-primary border-b border-primary pb-1">01</span>
              <span className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors">02</span>
              <span className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors">03</span>
              <span className="text-on-surface-variant">...</span>
              <span className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors">12</span>
            </div>
            <button className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary flex items-center gap-2">
              Next <span className="material-symbols-outlined text-sm">east</span>
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="pt-20">
      <Suspense fallback={<div className="h-screen w-full bg-surface"></div>}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
