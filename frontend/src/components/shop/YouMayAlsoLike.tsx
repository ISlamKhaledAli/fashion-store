"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { useProductList } from "@/hooks/useProductList";

interface Props {
  categorySlug: string;
  excludeId: string; // exclude current product
}

export const YouMayAlsoLike = ({ categorySlug, excludeId }: Props) => {
  const { products: allProducts, loading } = useProductList({
    limit: 8,
    excludeId,
    category: categorySlug,
  });

  const products = allProducts.slice(0, 4);

  if (loading) {
    return (
      <section className="border-t border-surface-container bg-transparent py-32">
        <div className="mx-auto max-w-[1440px] px-12">
          <div className="mb-12 flex justify-center">
            <div className="h-4 w-48 animate-pulse rounded bg-surface-container-low"></div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group cursor-wait">
                <div className="mb-4 aspect-3/4 animate-pulse overflow-hidden bg-surface-container-low"></div>
                <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-surface-container-low"></div>
                <div className="h-4 w-1/4 animate-pulse rounded bg-surface-container-low"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="border-t border-surface-container bg-transparent py-32">
      <div className="mx-auto max-w-[1440px] px-12">
        <h2 className="mb-12 text-center text-xs tracking-[0.2em] text-on-surface-variant uppercase">
          You May Also Like
        </h2>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {products.map((product: Product, idx: number) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="relative mb-4 flex aspect-3/4 items-center justify-center overflow-hidden bg-surface-container-low">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-zinc-400">
                    checkroom
                  </span>
                )}
              </div>
              <h4 className="truncate text-sm font-medium tracking-widest uppercase">
                {product.name}
              </h4>
              <p className="mt-1 text-sm text-on-surface-variant">
                ${product.price.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
