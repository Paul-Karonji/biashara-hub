/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import { ShopFilters } from "@/components/product/ShopFilters"
import Link from "next/link"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    minPrice?: string
    maxPrice?: string
    sizes?: string
    colors?: string
    sort?: string
    page?: string
  }>
}

// Enable Incremental Static Regeneration (ISR) - revalidate every 60 seconds
export const revalidate = 60

// Pre-render the top category paths statically during build time
export async function generateStaticParams() {
  try {
    const response = await medusa.store.category.list({
      limit: 100, // Pre-render up to 100 categories
    })
    return (response.product_categories || []).map((cat) => ({
      slug: cat.handle,
    }))
  } catch (error) {
    console.error("Failed to generate static params for category pages:", error)
    return []
  }
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const response = await medusa.store.category.list({
      handle: slug,
    })
    const category = response.product_categories?.[0]
    
    if (!category) {
      return {
        title: "Category Not Found | Biashara Hub",
      }
    }

    return {
      title: `${category.name} — Quality Products | Biashara Hub`,
      description: category.description || `Browse quality ${category.name} at Biashara Hub. Seamless M-Pesa payments and fast delivery across Kenya.`,
    }
  } catch (error) {
    console.error("Error generating metadata for category page:", error)
    return {
      title: "Biashara Hub Category",
    }
  }
}

// Fetch category and its products
async function getCategoryData(slug: string) {
  try {
    const catResponse = await medusa.store.category.list({
      handle: slug,
    })
    const category = catResponse.product_categories?.[0]
    if (!category) return null

    const prodResponse = await medusa.store.product.list({
      category_id: [category.id],
      fields: "*variants.prices,*variants.options",
    })

    return {
      category,
      products: prodResponse.products || [],
    }
  } catch (error) {
    console.error("Failed to fetch category and products:", error)
    return null
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, products } = data

  // Resolve search parameters
  const sParams = await searchParams
  const minPrice = sParams.minPrice || ""
  const maxPrice = sParams.maxPrice || ""
  const sizes = sParams.sizes?.split(",").filter(Boolean) || []
  const colors = sParams.colors?.split(",").filter(Boolean) || []
  const sort = sParams.sort || "newest"
  const page = sParams.page || "1"

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
    if (sizes.length > 0) urlParams.set("sizes", sParams.sizes || "")
    if (colors.length > 0) urlParams.set("colors", sParams.colors || "")
    if (sort !== "newest") urlParams.set("sort", sort)
    urlParams.set("page", String(pageNumber))
    return `/c/${slug}?${urlParams.toString()}`
  }

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Category Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-gold tracking-wider uppercase">
              Collection
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-text mt-1">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted text-sm mt-2 max-w-xl">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex justify-center flex-shrink-0">
            <ShopFilters />
          </div>
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {paginatedProducts.map((product: any, idx: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isNew={idx === 0 && currentPage === 1}
                  isSale={idx === 1}
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
              We couldn&apos;t find any items in this category matching your active filters. Try clearing some options.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
