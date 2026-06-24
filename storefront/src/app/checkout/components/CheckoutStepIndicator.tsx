"use client"
import { Check } from "lucide-react"

type Step = "address" | "shipping" | "payment" | "review"
const STEPS: { id: Step; label: string }[] = [
  { id: "address", label: "Address" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
]

export function CheckoutStepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="flex justify-between items-center relative border-b border-border pb-6">
      {STEPS.map((s, idx) => {
        const isActive = current === s.id
        const isPast = currentIdx > idx
        return (
          <div key={s.id} className="flex items-center gap-2 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              isActive
                ? "bg-primary text-white ring-4 ring-primary/10"
                : isPast
                ? "bg-success text-white"
                : "bg-surface border border-border text-muted"
            }`}>
              {isPast ? <Check size={14} /> : idx + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${isActive ? "text-primary font-bold" : "text-muted"}`}>
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
