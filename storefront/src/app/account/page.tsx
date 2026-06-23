"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, LogOut, ShoppingBag, Truck, Loader } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { formatKES } from "@/lib/formatters"

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        // Fetch logged-in customer profile
        const customerResponse = await medusa.store.customer.retrieve()
        if (customerResponse.customer) {
          setCustomer(customerResponse.customer)

          // Fetch orders belonging to the customer
          try {
            const ordersResponse = await medusa.store.order.list()
            setOrders(ordersResponse.orders || [])
          } catch (orderErr) {
            console.error("Failed to fetch customer orders:", orderErr)
          }
        } else {
          router.push("/login")
        }
      } catch (err) {
        console.error("Not authenticated:", err)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [router])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // In Medusa v2, you can log out by deleting cookies or calling sdk auth logout if available.
      // A POST request to /store/auth/logout is standard. Let's use the generic client fetch
      await medusa.client.fetch("/store/auth", {
        method: "DELETE"
      })
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("Logout failed:", err)
      // Force redirect anyway
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-muted text-sm font-semibold">
          <Loader className="animate-spin text-primary" size={24} />
          <span>Loading your account details...</span>
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Profile Summary */}
        <div className="md:col-span-1 bg-white border border-border rounded-2xl p-6 space-y-6 h-fit">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <User size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="text-text font-bold text-sm truncate">
                {customer.first_name} {customer.last_name}
              </h2>
              <span className="text-[10px] text-muted truncate block">{customer.email}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="text-xs text-muted">
              <span className="font-semibold text-text block">Phone Number</span>
              {customer.phone || "No phone number saved"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-11 border border-border hover:bg-danger/5 text-muted hover:text-danger text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Right Dashboard Area: Orders */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-text font-bold text-lg">Order History</h2>
              <span className="text-xs bg-surface text-muted border border-border px-2.5 py-1 rounded-full font-semibold">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-muted mx-auto">
                  <ShoppingBag size={20} />
                </div>
                <h3 className="text-text font-bold text-sm">No orders yet</h3>
                <p className="text-muted text-xs max-w-xs mx-auto leading-relaxed">
                  You haven&apos;t placed any orders on Biashara Hub yet. When you place an order, it will show up here.
                </p>
                <Link
                  href="/shop"
                  className="h-10 px-5 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => {
                  const itemsCount = order.items?.reduce((tot: number, it: any) => tot + it.quantity, 0) || 0
                  return (
                    <div 
                      key={order.id} 
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                          Order Reference
                        </span>
                        <h4 className="text-text font-bold text-sm">
                          #{order.display_id || order.id.slice(-8).toUpperCase()}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted font-medium pt-1">
                          <span>Qty: {itemsCount}</span>
                          <span>•</span>
                          <span className="text-primary font-bold">{formatKES(order.total)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <div className="flex flex-col items-start sm:items-end text-xs">
                          <span className="font-semibold text-text flex items-center gap-1">
                            <Truck size={14} className="text-primary" />
                            <span className="capitalize">{order.fulfillment_status || "Processing"}</span>
                          </span>
                          <span className="text-[10px] text-muted font-medium mt-0.5">
                            Status: <span className="capitalize">{order.status}</span>
                          </span>
                        </div>

                        <Link
                          href={`/order/${order.id}`}
                          className="h-9 px-4 border border-border hover:bg-surface text-text text-xs font-semibold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          View Summary
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
