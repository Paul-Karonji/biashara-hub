"use client"

import React, { useState, useEffect } from "react"
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react"

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeFilters: {
    minPrice: string
    maxPrice: string
    sizes: string[]
    colors: string[]
    sort: string
  }
  onApplyFilters: (filters: any) => void
  onResetFilters: () => void
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"]
const AVAILABLE_COLORS = ["Black", "White", "Blue", "Red", "Gold", "Grey"]
const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title_asc", label: "Name: A to Z" },
]

export function FilterDrawer({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  onResetFilters,
}: FilterDrawerProps) {
  const [minPrice, setMinPrice] = useState(activeFilters.minPrice)
  const [maxPrice, setMaxPrice] = useState(activeFilters.maxPrice)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(activeFilters.sizes)
  const [selectedColors, setSelectedColors] = useState<string[]>(activeFilters.colors)
  const [sort, setSort] = useState(activeFilters.sort)

  // Sync state with props when drawer opens or updates
  useEffect(() => {
    setMinPrice(activeFilters.minPrice)
    setMaxPrice(activeFilters.maxPrice)
    setSelectedSizes(activeFilters.sizes)
    setSelectedColors(activeFilters.colors)
    setSort(activeFilters.sort)
  }, [activeFilters, isOpen])

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      sizes: selectedSizes,
      colors: selectedColors,
      sort,
    })
    onClose()
  }

  const handleReset = () => {
    setMinPrice("")
    setMaxPrice("")
    setSelectedSizes([])
    setSelectedColors([])
    setSort("newest")
    onResetFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-elevated animate-fade-in animate-duration-200">
        
        {/* Header */}
        <div className="h-20 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text font-bold">
            <SlidersHorizontal size={18} className="text-primary" />
            <span>Filter & Sort Catalog</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface flex items-center justify-center text-muted hover:text-text cursor-pointer border border-border"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          
          {/* Sorting */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-primary" />
              Sort Products By
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sort === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSort(opt.value)}
                    className={`h-11 px-4 text-xs font-semibold rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                        : "border-border bg-white text-text hover:border-muted"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 border-t border-border pt-6">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              Price Range (KES)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted font-bold uppercase">Min Price</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-11 px-3 bg-surface border border-border rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted font-bold uppercase">Max Price</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-11 px-3 bg-surface border border-border rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3 border-t border-border pt-6">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              Filter by Sizes
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size)
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`h-10 px-4 text-xs font-semibold rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-text hover:border-muted"
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3 border-t border-border pt-6">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              Filter by Colors
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = selectedColors.includes(color)
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`h-10 px-4 text-xs font-semibold rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-text hover:border-muted"
                    }`}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="h-24 border-t border-border px-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 h-12 border border-border hover:bg-surface text-text text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-12 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  )
}
