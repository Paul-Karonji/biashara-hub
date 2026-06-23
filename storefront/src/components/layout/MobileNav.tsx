"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react"
import { useCart } from "@/context/CartContext"
import type { CartLineItem } from "@/lib/types"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/shop", icon: LayoutGrid, label: "Shop" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/cart", icon: ShoppingBag, label: "Cart", isCart: true },
  { href: "/account", icon: User, label: "Account" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { cart } = useCart()
  const cartCount = cart?.items?.reduce((t: number, i: CartLineItem) => t + i.quantity, 0) || 0

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex items-center h-16">
      <div className="flex items-center justify-around w-full px-2">
        {navItems.map(({ href, icon: Icon, label, isCart }) => {
          // Active if exact match, or starts with path (for /shop, /account etc.)
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center relative px-3 transition-colors ${
                isActive ? "text-primary" : "text-muted hover:text-text"
              }`}
              aria-label={label}
            >
              <Icon size={20} />
              {isCart && cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
