/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Arrivals | Biashara Hub",
  description: "Browse the latest arrivals at Biashara Hub. Genuine products, secure payment prompts, and fast delivery in Kenya.",
}

async function getNewArrivals() {
  try {
    const response = await medusa.store.product.list({
      fields: "*variants.prices",
    })
    // Sort products by created_at descending (latest first) if available, otherwise return as is
    const products = response.products || []
    return [...products].sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error("Failed to fetch new arrivals:", error)
    return []
  }
}

export default async function NewArrivalsPage() {
  const products = await getNewArrivals()

  return (
    <div className="flex-1 bg-background py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs font-semibold text-gold tracking-wider uppercase font-sans">
            Curated Collections
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-text mt-1">
            New Arrivals
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl leading-relaxed font-sans">
            Be the first to shop our newest arrivals. High-quality items freshly stocked and ready for nationwide courier dispatch.
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product: any, idx: number) => (
              <ProductCard
                key={product.id}
                product={product}
                isNew={idx < 4}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-surface rounded-md p-16 border border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-text font-bold text-base">No Products Found</h3>
            <p className="text-muted-foreground text-xs mt-1 max-w-xs leading-relaxed font-sans">
              We couldn&apos;t load the product catalog. Ensure your Medusa backend server is running.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
