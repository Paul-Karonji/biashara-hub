"use client"

import { useState, useEffect, useCallback } from "react"

export interface WishlistItem {
  id: string
  title: string
  handle: string | null
  thumbnail: string | null
  price?: number
}

const STORAGE_KEY = "wishlist"

/** Read the raw wishlist array safely from localStorage. */
function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WishlistItem[]) : []
  } catch {
    return []
  }
}

/** Persist the wishlist array to localStorage. */
function writeStorage(items: WishlistItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    console.error("[useWishlist] Failed to persist wishlist to localStorage.")
  }
}

// ── Module-level subscriber set so all hook instances stay in sync ────────────
// When one component updates the wishlist (e.g. ProductCard), every other
// component that called useWishlist() (e.g. the wishlist page) re-renders
// without needing a React Context or prop-drilling.
const subscribers = new Set<() => void>()

function notifyAll() {
  subscribers.forEach((fn) => fn())
}

/**
 * useWishlist — centralised wishlist state synced to localStorage.
 *
 * Optionally accepts a `productId` to expose a fast `isWishlisted` boolean
 * for a specific product (used by ProductCard and ProductDetailsClient).
 * When `productId` is omitted, only the full list and mutation helpers are
 * returned (used by the wishlist page).
 */
export function useWishlist(productId?: string) {
  const [items, setItems] = useState<WishlistItem[]>(() => readStorage())

  // Subscribe to cross-component updates
  useEffect(() => {
    const refresh = () => setItems(readStorage())
    subscribers.add(refresh)
    return () => { subscribers.delete(refresh) }
  }, [])

  const isWishlisted = productId
    ? items.some((item) => item.id === productId)
    : false

  /** Add a product to the wishlist. No-op if already present. */
  const addToWishlist = useCallback((item: WishlistItem) => {
    const current = readStorage()
    if (current.some((i) => i.id === item.id)) return
    const updated = [...current, item]
    writeStorage(updated)
    setItems(updated)
    notifyAll()
  }, [])

  /** Remove a product from the wishlist by ID. */
  const removeFromWishlist = useCallback((id: string) => {
    const updated = readStorage().filter((i) => i.id !== id)
    writeStorage(updated)
    setItems(updated)
    notifyAll()
  }, [])

  /**
   * Toggle a product's wishlist status.
   * Pass the full WishlistItem so it can be added if not yet present.
   */
  const toggleWishlist = useCallback(
    (item: WishlistItem) => {
      const current = readStorage()
      const exists = current.some((i) => i.id === item.id)
      const updated = exists
        ? current.filter((i) => i.id !== item.id)
        : [...current, item]
      writeStorage(updated)
      setItems(updated)
      notifyAll()
    },
    []
  )

  return { items, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist }
}
