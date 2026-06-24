/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Best Sellers | Biashara Hub",
  description: "Explore the most popular items at Biashara Hub. Top-selling electronics, fashion, and home goods across Kenya.",
}

async function getBestSellers() {
  try {
    const response = await medusa.store.product.list({
      fields: "*variants.prices",
    })
    // For demonstration, return products list (first few marked as hot/bestseller)
    return response.products || []
  } catch (error) {
    console.error("Failed to fetch best sellers:", error)
    return []
  }
}

export default async function BestSellersPage() {
  const products = await getBestSellers()

  return (
    <div className="flex-1 bg-background py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs font-semibold text-gold tracking-wider uppercase font-sans">
            Top Rated
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-text mt-1">
            Best Sellers
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl leading-relaxed font-sans">
            Explore customer favorites. These highly rated products represent the best quality and value for money, ordered and shipped daily.
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product: any, idx: number) => (
              <ProductCard
                key={product.id}
                product={product}
                isSale={idx === 1 || idx === 3}
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
