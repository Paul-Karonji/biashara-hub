"use client"
import { ShieldCheck, Smartphone, X } from "lucide-react"

interface MpesaOverlayProps {
  phone: string
  timer: number
  onCancel: () => void
}

function normalizeDisplayPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "").replace(/^\+/, "")
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`
  if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) return `254${cleaned}`
  return cleaned
}

export function MpesaOverlay({ phone, timer, onCancel }: MpesaOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md p-8 max-w-md w-full border border-border text-center space-y-6 shadow-elevated relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-muted hover:text-text transition-colors cursor-pointer"
          aria-label="Cancel M-Pesa payment"
        >
          <X size={16} />
        </button>

        <div className="flex justify-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-surface border-t-primary animate-spin" />
            <Smartphone className="absolute text-primary" size={24} />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Lipa Na M-Pesa online</span>
          <h3 className="text-text font-bold text-lg">STK Prompt Initiated</h3>
          <p className="text-muted text-xs leading-relaxed max-w-xs mx-auto">
            Safaricom has sent an STK prompt to your phone{" "}
            <span className="font-semibold text-text">{normalizeDisplayPhone(phone)}</span>. Please enter your M-Pesa PIN on your mobile phone screen.
          </p>
        </div>

        <div className="bg-surface rounded-md p-4 border border-border">
          <span className="text-[10px] text-muted font-semibold block uppercase">Awaiting M-Pesa PIN Input</span>
          <span className="text-sm font-bold text-primary mt-1 block">Checking status… Timeout in {timer}s</span>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-danger hover:underline font-medium cursor-pointer"
        >
          Wrong number or didn&apos;t receive a prompt? Cancel and go back.
        </button>

        <div className="text-[10px] text-muted flex items-center gap-1.5 justify-center">
          <ShieldCheck size={14} className="text-success" />
          <span>Payment transactions are secured by Safaricom Daraja.</span>
        </div>
      </div>
    </div>
  )
}

export function PaystackOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md p-8 max-w-md w-full border border-border text-center space-y-6 shadow-elevated">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-surface border-t-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Secure Checkout</span>
          <h3 className="text-text font-bold text-lg">Redirecting to Paystack</h3>
          <p className="text-muted text-xs leading-relaxed max-w-xs mx-auto">
            You are being securely redirected to Paystack to complete your card payment. Please do not close this tab.
          </p>
        </div>
        <div className="text-[10px] text-muted flex items-center gap-1.5 justify-center">
          <ShieldCheck size={14} className="text-success" />
          <span>256-bit SSL encrypted connection via Paystack.</span>
        </div>
      </div>
    </div>
  )
}
