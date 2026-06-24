import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQs | Biashara Hub",
  description: "Frequently Asked Questions about shopping, local M-Pesa payment prompt verification, and delivery terms on Biashara Hub.",
}

const FAQ_ITEMS = [
  {
    question: "How do I make a payment using M-Pesa?",
    answer: `We support two M-Pesa checkout flows. The primary method is **M-Pesa STK Push**: enter your active phone number at checkout and we will send a secure pin validation prompt directly to your phone screen. Alternatively, you can use **Manual Till Payment**: send the amount to Buy Goods Till Number **${process.env.NEXT_PUBLIC_MPESA_TILL_NUMBER || '174379'}** and input the 10-character Safaricom transaction confirmation code (e.g., QND46T89XZ) on our site to verify immediately.`
  },
  {
    question: "Do you support credit/debit cards?",
    answer: "Yes, card payments are processed securely through **Paystack**. We accept all local and international Visa, Mastercard, and AMEX credit or debit cards."
  },
  {
    question: "What are your delivery locations and charges?",
    answer: "We offer flat-rate courier shipping to Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, and other key towns across Kenya. Shipping costs are dynamically calculated based on your county selection at checkout. Most deliveries arrive at your doorstep or nearest parcel office within 2 to 4 business days."
  },
  {
    question: "Can I return a product if I am not satisfied?",
    answer: "Yes! We operate a transparent **7-day returns policy**. If the item is unused, in its original packaging, and has not been marked as non-returnable (e.g. personal care items, sales), you can coordinate a return. Check our full Returns Policy page for details."
  },
  {
    question: "How long do refunds take to reflect?",
    answer: "Approved refunds are processed instantly. **M-Pesa refunds** reflect on your phone balance within 24 hours. **Card refunds** processed through Paystack typically reflect in 5 to 10 bank business days depending on your card issuer."
  },
  {
    question: "Where are your physical stores located?",
    answer: "Biashara Hub operates as a headless digital storefront with warehousing facilities in Nairobi on Mombasa Road. We coordinate dispatch directly from our central fulfillment facility to keep costs low and pass savings to you."
  }
]

export default function FAQsPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold text-gold tracking-widest uppercase font-sans">
            Got Questions?
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-text mt-1 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto leading-relaxed font-sans">
            Everything you need to know about payments, shipping, orders, and returns on the Biashara Hub platform.
          </p>
        </div>

        {/* FAQs list */}
        <div className="space-y-6">
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} className="p-6 bg-surface border border-border rounded-md space-y-2">
              <h3 className="text-sm font-semibold text-text font-serif">
                {faq.question}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
