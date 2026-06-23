"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, ShoppingBag } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { ProductCard } from "@/components/product/ProductCard"
import { trackSearch } from "@/lib/analytics"
import { searchProducts } from "@/lib/search"

interface SearchResultsContentProps {
  query: string
}

function SearchResultsContent({ query }: SearchResultsContentProps) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true)
      try {
        let results: any[] = []
        if (query) {
          results = await searchProducts(query)
        }
        
        // If MeiliSearch returns no results or is unconfigured, fall back to standard Medusa DB search
        if (results.length === 0) {
          console.log("No MeiliSearch hits or unconfigured. Falling back to DB search...")
          const response = await medusa.store.product.list({
            q: query || undefined,
            fields: "*variants.prices",
          })
          results = response.products || []
        }

        setProducts(results)
        if (query) {
          trackSearch(query, results.length)
        }
      } catch (error) {
        console.error("Primary MeiliSearch failed, attempting fallback to DB search:", error)
        try {
          const response = await medusa.store.product.list({
            q: query || undefined,
            fields: "*variants.prices",
          })
          setProducts(response.products || [])
        } catch (fallbackError) {
          console.error("Fallback DB search failed:", fallbackError)
          setProducts([])
        }
      }
      setIsLoading(false)
    }

    fetchSearchResults()
  }, [query])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`
    } else {
      window.location.href = `/search`
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Header Search Form */}
      <div className="max-w-xl mx-auto mb-12">
        <form 
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 border border-border rounded-2xl px-4 h-12 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm"
        >
          <Search size={20} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search quality products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-text text-sm placeholder:text-muted h-full"
          />
        </form>

        <p className="text-center text-xs text-muted mt-2">
          {query ? (
            <span>Search results for &quot;<span className="text-text font-bold">{query}</span>&quot;</span>
          ) : (
            <span>Enter keywords above to search the catalog</span>
          )}
        </p>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-muted font-medium">
          Searching catalog...
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">
            Found {products.length} {products.length === 1 ? "Product" : "Products"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 border border-border text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-text font-bold text-base">No results found</h3>
          <p className="text-muted text-xs mt-1 max-w-xs">
            We couldn&apos;t find any items matching your terms. Try using different keywords or checking spelling.
          </p>
        </div>
      )}
    </div>
  )
}

function SearchPageWrapper() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  return <SearchResultsContent key={query} query={query} />
}

export default function SearchPage() {
  return (
    <div className="flex-1 bg-background py-12">
      <Suspense fallback={
        <div className="py-24 text-center text-xs text-muted font-medium">
          Loading Search...
        </div>
      }>
        <SearchPageWrapper />
      </Suspense>
    </div>
  )
}
