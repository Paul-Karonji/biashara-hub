"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { FilterDrawer } from "./FilterDrawer"

export function ShopFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  // Get active filters from URL parameters
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const sizes = searchParams.get("sizes")?.split(",").filter(Boolean) || []
  const colors = searchParams.get("colors")?.split(",").filter(Boolean) || []
  const sort = searchParams.get("sort") || "newest"

  const activeFilters = {
    minPrice,
    maxPrice,
    sizes,
    colors,
    sort,
  }

  // Count active filters to show badge
  const activeCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sizes.length > 0 ? 1 : 0) +
    (colors.length > 0 ? 1 : 0) +
    (sort !== "newest" ? 1 : 0)

  const handleApplyFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or delete minPrice
    if (newFilters.minPrice) {
      params.set("minPrice", newFilters.minPrice)
    } else {
      params.delete("minPrice")
    }

    // Update or delete maxPrice
    if (newFilters.maxPrice) {
      params.set("maxPrice", newFilters.maxPrice)
    } else {
      params.delete("maxPrice")
    }

    // Update or delete sizes
    if (newFilters.sizes && newFilters.sizes.length > 0) {
      params.set("sizes", newFilters.sizes.join(","))
    } else {
      params.delete("sizes")
    }

    // Update or delete colors
    if (newFilters.colors && newFilters.colors.length > 0) {
      params.set("colors", newFilters.colors.join(","))
    } else {
      params.delete("colors")
    }

    // Update or delete sort
    if (newFilters.sort && newFilters.sort !== "newest") {
      params.set("sort", newFilters.sort)
    } else {
      params.delete("sort")
    }

    // Reset pagination to first page upon filter change
    params.delete("page")

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleResetFilters = () => {
    router.push(pathname)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-11 px-5 border border-border bg-white text-text hover:border-muted text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all relative"
      >
        <SlidersHorizontal size={16} className="text-primary" />
        Filter & Sort
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      <FilterDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </>
  )
}
