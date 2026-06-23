/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import { ShopFilters } from "@/components/product/ShopFilters"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop All Products | Biashara Hub",
  description: "Browse the full catalog of quality items on Biashara Hub. Seamless M-Pesa pay, fast dispatch, and secure doorstep delivery in Kenya.",
}

interface PageProps {
  searchParams: Promise<{
    minPrice?: string
    maxPrice?: string
    sizes?: string
    colors?: string
    sort?: string
    page?: string
  }>
}

async function getShopData() {
  try {
    const productsResponse = await medusa.store.product.list({
      fields: "*variants.prices,*variants.options",
    })
    const categoriesResponse = await medusa.store.category.list()

    return {
      products: productsResponse.products || [],
      categories: categoriesResponse.product_categories || [],
    }
  } catch (error) {
    console.error("Failed to fetch shop data:", error)
    return {
      products: [],
      categories: [],
    }
  }
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { products, categories } = await getShopData()
  
  // Resolve search parameters
  const params = await searchParams
  const minPrice = params.minPrice || ""
  const maxPrice = params.maxPrice || ""
  const sizes = params.sizes?.split(",").filter(Boolean) || []
  const colors = params.colors?.split(",").filter(Boolean) || []
  const sort = params.sort || "newest"
  const page = params.page || "1"

  // 1. Apply Filtering
  let filtered = [...products]

  if (minPrice) {
    const minVal = parseFloat(minPrice) * 100 // Medusa prices in cents
    filtered = filtered.filter((p) => {
      const variant = p.variants?.[0] as any
      const price = variant?.prices?.find((pr: any) => pr.currency_code.toLowerCase() === "kes")?.amount 
        || variant?.prices?.[0]?.amount 
        || 0
      return price >= minVal
    })
  }

  if (maxPrice) {
    const maxVal = parseFloat(maxPrice) * 100
    filtered = filtered.filter((p) => {
      const variant = p.variants?.[0] as any
      const price = variant?.prices?.find((pr: any) => pr.currency_code.toLowerCase() === "kes")?.amount 
        || variant?.prices?.[0]?.amount 
        || 0
      return price <= maxVal
    })
  }

  if (sizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants?.some((v: any) => {
        // Medusa variants options holds values like { Size: "S", Color: "Black" }
        // Let's check keys case-insensitively
        const optionSize = v.options?.find((o: any) => o.option?.title?.toLowerCase() === "size")?.value 
          || v.options?.Size 
          || v.options?.size
        return sizes.includes(optionSize)
      })
    )
  }

  if (colors.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants?.some((v: any) => {
        const optionColor = v.options?.find((o: any) => o.option?.title?.toLowerCase() === "color")?.value 
          || v.options?.Color 
          || v.options?.color
        return colors.includes(optionColor)
      })
    )
  }

  // 2. Apply Sorting
  if (sort === "price_asc") {
    filtered.sort((a, b) => {
      const variantA = a.variants?.[0] as any
      const variantB = b.variants?.[0] as any
      const priceA = variantA?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || 0
      const priceB = variantB?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || 0
      return priceA - priceB
    })
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => {
      const variantA = a.variants?.[0] as any
      const variantB = b.variants?.[0] as any
      const priceA = variantA?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || 0
      const priceB = variantB?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")?.amount || 0
      return priceB - priceA
    })
  } else if (sort === "title_asc") {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  }

  // 3. Apply Pagination
  const limit = 8
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / limit)
  const currentPage = Math.max(1, parseInt(page))
  const offset = (currentPage - 1) * limit
  const paginatedProducts = filtered.slice(offset, offset + limit)

  // Helper to build URLs for page transitions
  const buildPageUrl = (pageNumber: number) => {
    const urlParams = new URLSearchParams()
    if (minPrice) urlParams.set("minPrice", minPrice)
    if (maxPrice) urlParams.set("maxPrice", maxPrice)
    if (sizes.length > 0) urlParams.set("sizes", params.sizes || "")
    if (colors.length > 0) urlParams.set("colors", params.colors || "")
    if (sort !== "newest") urlParams.set("sort", sort)
    urlParams.set("page", String(pageNumber))
    return `/shop?${urlParams.toString()}`
  }

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-gold tracking-wider uppercase">
              Full Catalog
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-text mt-1">
              Shop Our Products
            </h1>
            <p className="text-muted text-sm mt-1">
              Discover authentic items delivered straight to your door.
            </p>
          </div>
          <div className="flex justify-center flex-shrink-0">
            <ShopFilters />
          </div>
        </div>

        {/* Quick Category Filters */}
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2 justify-center md:justify-start">
            <Link
              href="/shop"
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all shadow-sm ${
                !params.sizes && !params.colors && !params.minPrice
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text hover:border-primary"
              }`}
            >
              All Products
            </Link>
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/c/${category.handle}`}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-white border border-border text-text hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {paginatedProducts.map((product: any, idx: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isNew={idx === 0 && currentPage === 1}
                  isSale={idx === 2}
                />
              ))}
            </div>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 border-t border-border pt-8 mt-12">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageUrl(currentPage - 1)}
                    className="h-10 px-5 border border-border bg-white text-text hover:bg-surface text-xs font-semibold rounded-xl flex items-center justify-center transition-all shadow-sm"
                  >
                    Previous
                  </Link>
                ) : (
                  <button
                    disabled
                    className="h-10 px-5 border border-border bg-surface text-muted text-xs font-semibold rounded-xl flex items-center justify-center opacity-50 cursor-not-allowed"
                  >
                    Previous
                  </button>
                )}

                <span className="text-xs text-muted font-medium">
                  Page <span className="text-text font-bold">{currentPage}</span> of {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildPageUrl(currentPage + 1)}
                    className="h-10 px-5 border border-border bg-white text-text hover:bg-surface text-xs font-semibold rounded-xl flex items-center justify-center transition-all shadow-sm"
                  >
                    Next
                  </Link>
                ) : (
                  <button
                    disabled
                    className="h-10 px-5 border border-border bg-surface text-muted text-xs font-semibold rounded-xl flex items-center justify-center opacity-50 cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl p-16 border border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-text font-bold text-base">No Products Found</h3>
            <p className="text-muted text-xs mt-1 max-w-xs leading-relaxed">
              We couldn&apos;t find any items matching your active filter criteria. Try resetting min/max price or options.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
