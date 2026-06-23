/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link"
import { ArrowRight, Smartphone, Shirt, Home, Dumbbell, Sparkles, ShoppingCart } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { TrustBar } from "@/components/shared/TrustBar"
import { ProductCard } from "@/components/product/ProductCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Biashara Hub — Quality Products. Trusted by Kenyans.",
  description: "Shop authentic gadgets, clothing, household goods, and groceries. Pay with M-Pesa STK Push and get nationwide doorstep delivery across Kenya.",
  openGraph: {
    title: "Biashara Hub — Quality Products. Trusted by Kenyans.",
    description: "Shop authentic gadgets, clothing, household goods, and groceries. Pay with M-Pesa STK Push and get nationwide doorstep delivery across Kenya.",
    type: "website",
  },
}

// Fetch products from Medusa backend
async function getProducts() {
  try {
    const response = await medusa.store.product.list({
      fields: "*variants.prices",
    })
    return response.products || []
  } catch (error) {
    console.error("Failed to fetch products from Medusa backend:", error)
    return []
  }
}

// Fetch categories from Medusa backend
async function getCategories() {
  try {
    const response = await medusa.store.category.list()
    return response.product_categories || []
  } catch (error) {
    console.error("Failed to fetch product categories from Medusa backend:", error)
    return []
  }
}

// Helper to map category handle to Lucide icons
const getCategoryIcon = (handle: string) => {
  switch (handle) {
    case "electronics":
      return Smartphone
    case "fashion":
      return Shirt
    case "home-&-living":
    case "home-living":
      return Home
    case "sports-&-outdoors":
    case "sports-outdoors":
      return Dumbbell
    case "beauty-&-health":
    case "beauty-health":
      return Sparkles
    default:
      return ShoppingCart
  }
}

export default async function HomePage() {
  const products = await getProducts()
  const categories = await getCategories()

  // Display top categories (up to 6)
  const displayCategories = categories.slice(0, 6)

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full min-h-[500px] md:h-[600px] bg-navy flex items-center overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold via-navy to-navy"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/25 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-0 w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
          {/* Left: Headline & CTAs */}
          <div className="flex flex-col items-start text-white max-w-xl">
            <span className="text-gold font-semibold tracking-wider text-xs md:text-sm uppercase mb-3">
              Premium Shopping Experience
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Quality Products.<br />
              <span className="text-gold-light">Trusted by Kenyans.</span>
            </h1>
            <p className="text-white/80 text-sm md:text-base mt-4 leading-relaxed">
              Shop authentic gadgets, clothing, household assets, and groceries. Seamless checkout with M-Pesa STK Push and nationwide door-to-door delivery.
            </p>
            <div className="flex flex-wrap gap-4 mt-8 w-full sm:w-auto">
              <Link
                href="/shop"
                className="h-12 px-6 bg-primary hover:bg-[#0b3175] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors duration-200 w-full sm:w-auto cursor-pointer"
              >
                Shop Now
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/offers"
                className="h-12 px-6 bg-transparent hover:bg-white/10 text-white border border-white/30 text-sm font-semibold rounded-xl flex items-center justify-center transition-colors duration-200 w-full sm:w-auto cursor-pointer"
              >
                Explore Deals
              </Link>
            </div>
          </div>

          {/* Right: Featured Visual Mockup (CSS designed layout) */}
          <div className="hidden md:flex justify-center items-center relative h-full">
            <div className="relative w-80 h-80 lg:w-[400px] lg:h-[400px] bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-elevated">
              {/* Overlapping premium cards simulation representing products */}
              <div className="absolute transform -rotate-6 -translate-x-12 -translate-y-6 w-48 h-60 bg-white rounded-2xl shadow-elevated border border-border p-4 flex flex-col justify-between">
                <div className="w-full h-32 rounded-xl bg-surface relative overflow-hidden flex items-center justify-center">
                  <Shirt size={48} className="text-primary/40" />
                </div>
                <div>
                  <span className="text-[10px] text-muted tracking-wider uppercase font-semibold">Fashion</span>
                  <h4 className="text-text font-bold text-xs line-clamp-1 mt-0.5">Classic Tee</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold text-xs">KES 1,500</span>
                    <span className="text-[9px] bg-gold-light/20 text-gold font-bold px-1.5 py-0.5 rounded">New</span>
                  </div>
                </div>
              </div>

              <div className="absolute transform rotate-6 translate-x-12 translate-y-6 w-48 h-60 bg-white rounded-2xl shadow-elevated border border-border p-4 flex flex-col justify-between z-10">
                <div className="w-full h-32 rounded-xl bg-surface relative overflow-hidden flex items-center justify-center">
                  <Smartphone size={48} className="text-primary/40" />
                </div>
                <div>
                  <span className="text-[10px] text-muted tracking-wider uppercase font-semibold">Electronics</span>
                  <h4 className="text-text font-bold text-xs line-clamp-1 mt-0.5">Smart Devices</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold text-xs">KES 15,000</span>
                    <span className="text-[9px] bg-danger/10 text-danger font-bold px-1.5 py-0.5 rounded">Sale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar Section */}
      <TrustBar />

      {/* 3. Featured Categories Grid */}
      {displayCategories.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 py-8 w-full">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[#0F172A] font-bold text-xl md:text-2xl">Featured Categories</h2>
              <p className="text-muted text-xs md:text-sm mt-1">Explore our curated collections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayCategories.map((category) => {
              const Icon = getCategoryIcon(category.handle)
              return (
                <Link
                  key={category.id}
                  href={`/c/${category.handle}`}
                  className="group flex flex-col items-center p-6 bg-white border border-border rounded-2xl hover:border-gold hover:shadow-card transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-primary group-hover:bg-gold-light/20 group-hover:text-gold transition-colors duration-200">
                    <Icon size={24} />
                  </div>
                  <span className="text-text font-medium text-xs mt-3 text-center group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* 4. Products Grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-12 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[#0F172A] font-bold text-xl md:text-2xl">Featured Products</h2>
            <p className="text-muted text-xs md:text-sm mt-1">Trending arrivals in Nairobi and across Kenya</p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-primary hover:text-navy text-xs font-semibold hover:underline"
          >
            See All Products
            <ArrowRight size={14} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product as any}
                isNew={idx === 0 || idx === 2}
                isSale={idx === 1}
              />
            ))}
          </div>
        ) : (
          <div className="w-full bg-surface rounded-2xl p-12 border border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-text font-bold text-base">No Products Found</h3>
            <p className="text-muted text-xs mt-1 max-w-xs">
              We couldn&apos;t load the products from the catalog database. Make sure your Medusa backend is running and seeded.
            </p>
          </div>
        )}
      </section>

      {/* 5. Benefits Section */}
      <section className="bg-navy py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-gold font-semibold tracking-wider text-xs uppercase">Why Choose Us</span>
            <h2 className="text-white font-bold text-2xl md:text-3xl mt-2">Why Shop with Biashara Hub?</h2>
            <p className="text-white/60 text-sm mt-2">Built for Kenyans. By Kenyans.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: "📱", title: "M-Pesa Payments", desc: "STK Push for instant & secure local payment — no card needed" },
              { icon: "🚚", title: "Nationwide Delivery", desc: "Door-to-door courier across all 47 counties in Kenya" },
              { icon: "🔒", title: "Secure Checkout", desc: "SSL encrypted · Your data is always safe with us" },
              { icon: "🧑‍💼", title: "Local Support", desc: "Nairobi-based team — call, WhatsApp, or email us" },
            ].map((benefit, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 text-center hover:bg-white/10 transition-colors">
                <span className="text-3xl block mb-3">{benefit.icon}</span>
                <h3 className="text-white font-bold text-sm">{benefit.title}</h3>
                <p className="text-white/60 text-xs mt-1.5 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Biashara Hub",
            "url": "https://biasharahub.co.ke",
            "logo": "https://biasharahub.co.ke/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "areaServed": "KE",
              "availableLanguage": ["English", "Swahili"]
            },
            "sameAs": [
              "https://facebook.com/biasharahub",
              "https://twitter.com/biasharahub",
              "https://instagram.com/biasharahub"
            ]
          })
        }}
      />
    </div>
  )
}
