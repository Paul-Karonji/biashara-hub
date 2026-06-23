/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CheckCircle2, ShieldCheck, Truck, ArrowRight } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { formatKES } from "@/lib/formatters"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Order Confirmed | Biashara Hub",
  description: "Thank you for your order! Your purchase on Biashara Hub is successful. Track your delivery details here.",
}

async function getOrderDetails(id: string) {
  try {
    const response = await medusa.store.order.retrieve(id, {
      fields: "*items,*shipping_address,*shipping_methods",
    })
    return response.order || null
  } catch (error) {
    console.error("Failed to fetch order details:", error)
    return null
  }
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrderDetails(id)

  if (!order) {
    notFound()
  }

  const items = order.items || []
  const shippingAddress = (order.shipping_address || {}) as any
  const total = order.total || 0
  const subtotal = order.subtotal || 0
  const shippingTotal = order.shipping_total || 0

  return (
    <div className="flex-1 bg-background py-16 md:py-24 animate-fade-in">
      <div className="max-w-[700px] mx-auto px-4 text-center space-y-8">
        
        {/* Success Icon & Heading */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mb-2">
            <CheckCircle2 size={36} className="animate-scale-up" />
          </div>
          <span className="text-xs font-bold text-success tracking-widest uppercase">
            Order Confirmed
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight">
            Thank you for your purchase!
          </h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            Your payment via M-Pesa is processed successfully. We have sent a confirmation email to <span className="font-semibold text-text">{order.email}</span>.
          </p>
        </div>

        {/* Order Card Detail Box */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden text-left shadow-card">
          {/* Card Header */}
          <div className="bg-surface border-b border-border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Order Reference</span>
              <h3 className="text-text font-bold text-sm mt-0.5">#{order.display_id || order.id.slice(-8).toUpperCase()}</h3>
            </div>
            <div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block sm:text-right">Shipping Speed</span>
              <span className="text-xs text-primary font-semibold block sm:text-right">
                {order.shipping_methods?.[0]?.name || "Standard Delivery"}
              </span>
            </div>
          </div>

          {/* Item details */}
          <div className="p-6 divide-y divide-border space-y-4">
            <div className="space-y-4 pb-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-muted">No img</div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-text font-bold text-xs">{item.title}</h4>
                      <span className="text-[10px] text-muted block">Quantity: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-primary font-bold text-xs">{formatKES(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Address Summary */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Deliver To</span>
                <p className="text-xs text-text font-medium">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                <p className="text-xs text-muted mt-0.5">{shippingAddress.phone}</p>
                <p className="text-xs text-muted mt-0.5">{shippingAddress.address_1}, {shippingAddress.city}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">Expected Delivery</span>
                <p className="text-xs text-text font-medium flex items-center gap-1.5">
                  <Truck size={14} className="text-primary" />
                  <span>2 — 4 Business Days</span>
                </p>
                <p className="text-[10px] text-muted mt-1 leading-relaxed">
                  Our delivery couriers will call or text you prior to dispatch.
                </p>
              </div>
            </div>

            {/* Calculations */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-muted">
                <span>Subtotal</span>
                <span>{formatKES(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted">
                <span>Shipping</span>
                <span>{formatKES(shippingTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-text font-bold text-xs">Total Paid</span>
                <span className="text-primary font-extrabold text-sm">{formatKES(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/shop"
            className="h-12 px-8 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/account"
            className="h-12 px-8 bg-white hover:bg-surface text-muted border border-border text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer w-full sm:w-auto"
          >
            Track Order Status
          </Link>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center gap-2 justify-center text-[10px] text-muted leading-relaxed">
          <ShieldCheck size={14} className="text-success" />
          <span>Lipa na M-Pesa secure transaction guarantee.</span>
        </div>

      </div>
    </div>
  )
}
