'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { useProductList } from '@/hooks/useProductList'

interface Props {
  categorySlug: string
  excludeId: string  // exclude current product
}

export const YouMayAlsoLike = ({ categorySlug, excludeId }: Props) => {
  const { products: allProducts, loading } = useProductList({ 
    limit: 8, 
    excludeId, 
    category: categorySlug 
  })
  
  const products = allProducts.slice(0, 4)

  if (loading) {
    return (
      <section className="bg-transparent border-t border-surface-container py-32">
        <div className="max-w-[1440px] mx-auto px-12">
          <div className="flex justify-center mb-12">
            <div className="h-4 w-48 bg-surface-container-low rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group cursor-wait">
                <div className="aspect-3/4 bg-surface-container-low mb-4 overflow-hidden animate-pulse"></div>
                <div className="h-4 w-2/3 bg-surface-container-low rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-1/4 bg-surface-container-low rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-transparent border-t border-surface-container py-32">
      <div className="max-w-[1440px] mx-auto px-12">
        <h2 className="text-xs tracking-[0.2em] uppercase text-on-surface-variant mb-12 text-center">
          You May Also Like
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: Product, idx: number) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="group animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="aspect-3/4 bg-surface-container-low mb-4 overflow-hidden relative">
                <Image 
                  src={product.images?.[0]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h4 className="text-sm font-medium uppercase tracking-widest truncate">
                {product.name}
              </h4>
              <p className="text-sm text-on-surface-variant mt-1">
                ${product.price.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
