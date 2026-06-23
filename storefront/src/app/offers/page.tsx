/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import { Sparkles, Tag, Percent, ShieldAlert } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exclusive Deals & Offers | Biashara Hub",
  description: "Save big on quality electronics, fashion, and accessories. Active promo codes, seasonal sales, and free delivery options in Kenya.",
}

async function getProducts() {
  try {
    const response = await medusa.store.product.list({
      fields: "*variants.prices",
    })
    return response.products || []
  } catch (error) {
    console.error("Failed to fetch products for offers page:", error)
    return []
  }
}

export default async function OffersPage() {
  const products = await getProducts()
  
  // For demo, we label products with odd index as discounted
  const offerProducts = products.map((p, idx) => ({
    product: p,
    isSale: idx % 2 === 1,
    originalPrice: idx % 2 === 1 ? ((p.variants?.[0] as any)?.prices?.[0]?.amount || 0) * 1.25 : undefined,
  }))

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4 space-y-12">
        
        {/* Banner/Header */}
        <div className="relative rounded-3xl overflow-hidden bg-navy text-white p-8 md:p-12 shadow-elevated">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-gold via-navy to-navy"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={12} />
              Limited Time Deals
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Biashara Hub <span className="text-gold-light">Super Deals</span>
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Save up to 25% on selected items. Seamless payment via M-Pesa STK Push and fast delivery across Kenya.
            </p>
          </div>
        </div>

        {/* Promo Codes Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border p-6 rounded-2xl flex gap-4 items-start shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
              <Percent size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-text font-bold text-sm">Welcome Discount</h3>
              <p className="text-xs text-muted">Use code <span className="font-bold text-primary">WELCOME10</span> to get 10% off your first checkout order.</p>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl flex gap-4 items-start shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold flex-shrink-0">
              <Tag size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-text font-bold text-sm">Free Delivery Threshold</h3>
              <p className="text-xs text-muted">Automatically save shipping costs (KES 300) for all cart checkouts above KES 5,000.</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            Deals of the Week
          </h2>

          {offerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {offerProducts.map(({ product, isSale }, idx) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  isSale={isSale}
                  isNew={idx === 0}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl p-16 text-center max-w-sm mx-auto flex flex-col items-center">
              <ShieldAlert size={36} className="text-muted/60 mb-3" />
              <h3 className="text-text font-bold text-sm">No Active Offers</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                There are no promotional offers in this collection right now. Check back soon for catalog updates!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
