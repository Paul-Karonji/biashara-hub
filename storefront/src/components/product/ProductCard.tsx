"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart } from "lucide-react"
import { formatKES } from "@/lib/formatters"
import { useCart } from "@/context/CartContext"

interface ProductCardProps {
  product: {
    id: string
    title: string
    handle: string
    thumbnail?: string | null
    variants?: Array<{
      id: string
      prices?: Array<{
        amount: number
        currency_code: string
      }>
    }>
  }
  isNew?: boolean
  isSale?: boolean
}

export function ProductCard({ product, isNew, isSale }: ProductCardProps) {
  const { addToCart, isLoading } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const firstVariant = product.variants?.[0]
  const firstVariantId = firstVariant?.id

  // Check if item is wishlisted on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wishlist")
      if (stored) {
        try {
          const list = JSON.parse(stored)
          setIsWishlisted(list.some((item: any) => item.id === product.id))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [product.id])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (typeof window === "undefined") return

    const stored = localStorage.getItem("wishlist")
    let list = []
    if (stored) {
      try {
        list = JSON.parse(stored)
      } catch (e) {
        console.error(e)
      }
    }

    let updatedList = []
    if (isWishlisted) {
      updatedList = list.filter((item: any) => item.id !== product.id)
      setIsWishlisted(false)
    } else {
      updatedList = [...list, {
        id: product.id,
        title: product.title,
        handle: product.handle,
        thumbnail: product.thumbnail,
        variants: product.variants
      }]
      setIsWishlisted(true)
    }
    localStorage.setItem("wishlist", JSON.stringify(updatedList))
  }

  const getDisplayPrice = () => {
    if (!firstVariant) return 0
    const kesPrice = firstVariant.prices?.find((p) => p.currency_code.toLowerCase() === "kes")
    return kesPrice ? kesPrice.amount : firstVariant.prices?.[0]?.amount || 0
  }

  const price = getDisplayPrice()

  return (
    <Link
      href={`/p/${product.handle}`}
      className="group flex flex-col bg-white rounded-md overflow-hidden border border-border transition-all duration-200 hover:scale-[1.02] hover:shadow-ambient"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-surface overflow-hidden">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No image
          </div>
        )}
        
        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-text border border-border flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-ambient"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={14} className={isWishlisted ? "fill-danger text-danger" : "text-text"} />
        </button>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSale && (
            <span className="bg-danger text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
              Sale
            </span>
          )}
          {isNew && (
            <span className="bg-primary text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md">
              New
            </span>
          )}
        </div>
      </div>

      {/* Info container */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-text font-medium text-sm leading-snug line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors duration-200">
          {product.title}
        </h3>
        
        {/* Rating stars */}
        <div className="flex items-center gap-0.5 mt-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className="fill-gold text-gold"
            />
          ))}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-auto pt-2 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-bold text-base">
              {formatKES(price)}
            </span>
          </div>
          
          <button 
            type="button"
            disabled={isLoading || !firstVariantId}
            className="w-full h-10 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-sm transition-colors duration-200 cursor-pointer flex items-center justify-center disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (firstVariantId) {
                addToCart(firstVariantId, 1)
              }
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
