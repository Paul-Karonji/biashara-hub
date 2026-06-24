import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Biashara Hub",
  description: "Read the Privacy Policy for Biashara Hub to understand how we secure and handle customer data in Kenya.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-8">
        <div>
          <span className="text-xs font-bold text-gold tracking-widest uppercase font-sans">Legal</span>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-text mt-1 tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none text-muted-foreground text-sm md:text-base leading-relaxed space-y-6">
          <p>
            At Biashara Hub, accessible from our storefront, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Biashara Hub and how we use it.
          </p>

          <h2 className="text-xl font-bold text-text pt-4 font-serif">1. Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <p>
            When you register for an Account, we may ask for your contact information, including items such as name, email address, and phone number (especially for Safaricom M-Pesa STK payment validation).
          </p>

          <h2 className="text-xl font-bold text-text pt-4 font-serif">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 font-sans text-sm">
            <li>Provide, operate, and maintain our storefront checkout.</li>
            <li>Improve, personalize, and expand our product selection.</li>
            <li>Understand and analyze how you use our storefront app.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Process your payments (via Safaricom STK Push and Paystack secure gateways).</li>
            <li>Send you transaction updates, shipping notifications, and receipts.</li>
          </ul>

          <h2 className="text-xl font-bold text-text pt-4 font-serif">3. Security of Data</h2>
          <p>
            We utilize industry-standard security layers to protect your credentials and payment tokens. Since we run an open-source headless database with native integrations, we do not store credit card credentials on our servers. All card payment details are handled securely by Paystack, a certified PCI-DSS compliant payment provider.
          </p>

          <h2 className="text-xl font-bold text-text pt-4 font-serif">4. Safaricom M-Pesa Transaction Safety</h2>
          <p>
            For transaction verification purposes, M-Pesa transaction reference codes and phone numbers are encrypted before being processed for reconciliation on our Daraja API endpoints.
          </p>
        </div>
      </div>
    </div>
  )
}
