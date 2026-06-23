import React from "react"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa"
import { ProductDetailsClient } from "@/components/product/ProductDetailsClient"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ handle: string }>
}

// Enable Incremental Static Regeneration (ISR) - revalidate every 60 seconds
export const revalidate = 60

// Pre-render the top product handles statically during build time
export async function generateStaticParams() {
  try {
    const response = await medusa.store.product.list({
      limit: 100, // Pre-render up to 100 products
    })
    return (response.products || []).map((product) => ({
      handle: product.handle,
    }))
  } catch (error) {
    console.error("Failed to generate static params for product pages:", error)
    return []
  }
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  try {
    const response = await medusa.store.product.list({
      handle,
    })
    const product = response.products?.[0]
    
    if (!product) {
      return {
        title: "Product Not Found | Biashara Hub",
      }
    }

    return {
      title: `${product.title} — Buy Online in Kenya | Biashara Hub`,
      description: product.description || `Buy ${product.title} online at the best price in Kenya. Pay via M-Pesa with fast nationwide delivery.`,
      openGraph: {
        title: product.title,
        description: product.description || "",
        images: product.thumbnail ? [{ url: product.thumbnail }] : [],
      },
    }
  } catch (error) {
    console.error("Error generating metadata for product page:", error)
    return {
      title: "Biashara Hub Product",
    }
  }
}

// Fetch product details
async function getProduct(handle: string) {
  try {
    const response = await medusa.store.product.list({
      handle,
      fields: "*variants,*variants.prices,*images,*categories",
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error("Failed to fetch product by handle:", error)
    return null
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  // Generate JSON-LD Structured Data for Product SEO
  const firstVariant = product.variants?.[0] as any
  const priceObj = firstVariant?.prices?.find((p: any) => p.currency_code.toLowerCase() === "kes")
  const priceAmount = priceObj ? priceObj.amount : (firstVariant?.prices?.[0]?.amount || 0)
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.thumbnail ? [product.thumbnail] : [],
    "description": product.description || `Buy ${product.title} online at Biashara Hub. Seamless M-Pesa payments and nationwide delivery in Kenya.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "KES",
      "price": priceAmount / 100, // Medusa amounts in cents
      "itemCondition": "https://schema.org/NewCondition",
      "availability": firstVariant ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    }
  }

  return (
    <div className="flex-1 bg-white">
      {/* Insert Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} />
    </div>
  )
}
