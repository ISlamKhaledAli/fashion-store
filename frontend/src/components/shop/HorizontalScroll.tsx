'use client'

import React, { useEffect, useState, useRef } from "react"
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  excludeSlug: string
}

export const HorizontalScroll = ({ excludeSlug }: Props) => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`)
        const data = await res.json()
        if (isMounted) {
          const filtered = data.data
            ?.filter((p: any) => p.slug !== excludeSlug)
            ?.slice(0, 8) || []
          setProducts(filtered)
        }
      } catch (err) {
        if (isMounted) setProducts([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchFeatured()
    return () => { isMounted = false }
  }, [excludeSlug])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <section className="bg-surface-container-low py-24 sm:py-32">
        <div className="max-w-[1440px] w-full mx-auto px-12">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-medium tracking-tight">Complete the Look</h2>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[320px]">
                <div className="aspect-3/4 bg-surface-container mb-4 overflow-hidden animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-surface-container rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/4 bg-surface-container rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="w-[98%] h-[2px] bg-black/90 dark:bg-white/90 mt-2 mb-8"></div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="bg-surface-container-low py-24 sm:py-32">
      <div className="max-w-[1440px] w-full mx-auto px-12">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-medium tracking-tight">Complete the Look</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-colors group"
            >
              <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5">chevron_left</span>
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-colors group"
            >
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5">chevron_right</span>
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto custom-scrollbar pb-12 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product: any, idx: number) => (
            <Link 
              key={product.id}
              href={`/products/${product.slug}`}
              className="min-w-[320px] snap-start group animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="aspect-3/4 bg-white overflow-hidden mb-4 relative">
                <Image 
                  src={product.images?.[0]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h4 className="font-medium truncate">{product.name}</h4>
              <p className="text-on-surface-variant text-sm mt-1">${product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
          <div className="w-[98%] h-[2px] bg-black/90 dark:bg-white/90 mt-2 mb-8"></div>
      </div>
    </section>
  )
}
