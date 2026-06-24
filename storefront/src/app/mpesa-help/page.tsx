import React from "react"
import { Smartphone, CheckCircle, HelpCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "M-Pesa Checkout Help Guide | Biashara Hub",
  description: "Step-by-step helper guide on paying with Safaricom Lipa Na M-Pesa STK Push and Buy Goods Till numbers on Biashara Hub.",
}

export default function MpesaHelpPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold text-gold tracking-widest uppercase font-sans">
            Payment Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-text mt-1 tracking-tight">
            Lipa Na M-Pesa Guide
          </h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto leading-relaxed font-sans">
            We support automated STK prompts and manual Till validation. Follow these steps to complete your checkout instantly.
          </p>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Method A: STK Prompt */}
          <div className="p-6 bg-surface border border-border rounded-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone size={18} />
              </div>
              <h2 className="text-base font-bold text-text font-serif">Method 1: STK Push Prompt</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              This is the fastest method. Safaricom sends a pop-up prompt directly to your phone screen requesting your PIN.
            </p>
            <ol className="list-decimal pl-4 text-xs text-text space-y-2.5 font-sans">
              <li>Enter your active Safaricom phone number in the payment step (format: `07xxxxxxxx` or `01xxxxxxxx`).</li>
              <li>Click **Continue to Review** and confirm your order.</li>
              <li>Wait for the M-Pesa push prompt dialog to appear on your phone screen.</li>
              <li>Enter your secure **M-Pesa PIN** and tap send.</li>
              <li>Wait 5-10 seconds on our checkout page. The system will automatically detect the payment and redirect you to the success screen.</li>
            </ol>
          </div>

          {/* Method B: Manual Till */}
          <div className="p-6 bg-surface border border-border rounded-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gold-light/20 flex items-center justify-center text-gold">
                <CheckCircle size={18} />
              </div>
              <h2 className="text-base font-bold text-text font-serif">Method 2: Manual Till Payment</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              If your line does not support STK push prompts, or the network is delayed, pay manually using our Buy Goods Till.
            </p>
            <ol className="list-decimal pl-4 text-xs text-text space-y-2.5 font-sans">
              <li>Open the SIM tool or M-Pesa App on your mobile phone.</li>
              <li>Go to **Lipa Na M-Pesa** &gt; **Buy Goods and Services**.</li>
              <li>Enter Till Number: <span className="font-bold text-primary font-mono">{process.env.NEXT_PUBLIC_MPESA_TILL_NUMBER || '174379'}</span>.</li>
              <li>Enter the exact order total displayed on your checkout summary.</li>
              <li>Enter your PIN and complete the transaction.</li>
              <li>Copy the **10-character confirmation code** from Safaricom SMS (e.g., `QND46T89XZ`).</li>
              <li>Paste the code in our manual payment input and click **Verify Code**. Once reconciled, click place order.</li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting Alert */}
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-4">
          <HelpCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide font-sans">Troubleshooting STK Prompts</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed font-sans">
              If you do not receive the pop-up prompt in 30 seconds:
              <br />• Verify that your SIM card is active and unlocked.
              <br />• Ensure your phone is not in Do Not Disturb or Airplane mode.
              <br />• Check if you have sufficient funds to cover the purchase.
              <br />• If prompts are consistently blocked by your SIM configuration, switch checkout flow to the manual till payment option.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
