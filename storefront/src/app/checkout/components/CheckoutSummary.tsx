"use client"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { formatKES } from "@/lib/formatters"

interface Props {
  items: any[]
  subtotal: number
  shippingTotal: number
  total: number
}

export function CheckoutSummary({ items, subtotal, shippingTotal, total }: Props) {
  return (
    <div className="bg-white rounded-md border border-border p-6 space-y-6 h-fit sticky top-24">
      <h2 className="text-text font-bold text-base">Checkout Summary</h2>

      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
        {items.map((item: any) => (
          <div key={item.id} className="flex gap-3 items-center">
            <div className="relative w-12 h-12 rounded-sm bg-surface border border-border overflow-hidden flex-shrink-0">
              {item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] text-muted">No img</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-text font-bold text-xs truncate">{item.title}</h4>
              <span className="text-[10px] text-muted block">Qty: {item.quantity}</span>
            </div>
            <span className="text-primary font-bold text-xs">{formatKES(item.unit_price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted font-medium">Subtotal</span>
          <span className="text-text font-bold">{formatKES(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted font-medium">Delivery</span>
          <span className="text-text font-bold">
            {shippingTotal > 0 ? formatKES(shippingTotal) : "KES 0 (Flat/TBD)"}
          </span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-center text-sm">
          <span className="text-text font-bold">Total</span>
          <span className="text-primary font-extrabold text-base">{formatKES(total)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted leading-relaxed justify-center border-t border-border pt-4">
        <ShieldCheck size={14} className="text-success" />
        <span>Secure connection &amp; nationwide fulfillment guarantee.</span>
      </div>
    </div>
  )
}
