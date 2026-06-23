import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Returns Policy | Biashara Hub",
  description: "Read the Biashara Hub returns policy. Easy returns and refunds for orders placed within Kenya.",
}

export default function ReturnsPolicyPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-8">
        <div>
          <span className="text-xs font-bold text-gold tracking-widest uppercase">Policies</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text mt-1 tracking-tight">Returns & Refunds Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none text-muted text-sm md:text-base leading-relaxed space-y-6">
          <p>
            At Biashara Hub, we value our customers and strive to ensure complete satisfaction. If you are not fully satisfied with your purchase, we are here to help.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">1. Return Window</h2>
          <p>
            You have **7 calendar days** to return an item from the date you received it. To be eligible for a return, your item must be unused, in the same condition that you received it, and in the original packaging.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">2. Non-Returnable Items</h2>
          <p>
            Certain types of items cannot be returned:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Perishable goods (e.g. food/groceries)</li>
            <li>Personal care items (cosmetics, intimate wear)</li>
            <li>Digital items (gift cards, software keys)</li>
            <li>On-sale items (specifically marked as non-returnable)</li>
          </ul>

          <h2 className="text-xl font-bold text-text pt-4">3. Refunds</h2>
          <p>
            Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
          </p>
          <p>
            If your return is approved, we will initiate a refund to your original payment method:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>M-Pesa:</strong> Reversed directly back to your M-Pesa phone number. The transaction typically reflects within 24 hours.</li>
            <li><strong>Card Payments:</strong> Refunded to your debit/credit card via Paystack. This might take 5-10 business days depending on your bank.</li>
          </ul>

          <h2 className="text-xl font-bold text-text pt-4">4. Return Shipping</h2>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>
        </div>
      </div>
    </div>
  )
}
