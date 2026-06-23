"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ShoppingBag, Heart, User, Search } from "lucide-react"
import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const { cart, setIsCartDrawerOpen } = useCart()
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cartItemsCount = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        window.location.href = `/search?q=${encodeURIComponent(value.trim())}`
      }, 500)
    }
  }

  return (
    <header className="h-20 bg-white border-b border-border sticky top-0 z-50 w-full shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Biashara Hub Logo"
              width={160}
              height={40}
              priority
              style={{ height: "40px", width: "auto" }}
            />
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
              }
            }}
            className="flex items-center gap-2 border border-border rounded-xl px-4 h-12 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
          >
            <Search size={20} className="text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search quality products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-text text-sm placeholder:text-muted h-full"
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <a 
            href="/account" 
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface text-text hover:text-primary transition-colors"
            title="Account"
          >
            <User size={22} />
          </a>
          
          <a 
            href="/wishlist" 
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface text-text hover:text-primary transition-colors relative"
            title="Wishlist"
          >
            <Heart size={22} />
          </a>

          <button 
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface text-text hover:text-primary transition-colors relative cursor-pointer border-0 bg-transparent"
            title="Shopping Cart"
          >
            <ShoppingBag size={22} />
            {cartItemsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

