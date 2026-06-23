import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Biashara Hub",
  description: "Learn more about Biashara Hub, Kenya's premier open-source ecommerce platform delivering quality products and secure payments.",
}

export default function AboutPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-8">
        <div className="text-center">
          <span className="text-xs font-bold text-gold tracking-widest uppercase">Our Story</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text mt-1 tracking-tight">About Biashara Hub</h1>
        </div>

        <div className="prose prose-slate max-w-none text-muted text-sm md:text-base leading-relaxed space-y-6">
          <p>
            Welcome to **Biashara Hub**, a premium ecommerce experience built from the ground up for Kenyan consumers and merchants. We believe in high-quality products, robust local payment integrations, and zero platform friction.
          </p>
          <p>
            Traditional marketplaces in East Africa often lock business owners into expensive subscriptions and charge heavy commission rates. Biashara Hub was designed to eliminate these barriers. By pairing open-source technology (**Medusa.js**) with edge storefront generation (**Next.js**), we enable direct customer-to-merchant trading with minimal overhead.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">Our Core Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Local Relevance:</strong> M-Pesa is a first-class citizen on our platform, offering seamless STK push triggers.</li>
            <li><strong>Premium Quality:</strong> Every design token, font scale, and page transition is tailored to provide a professional, trustworthy checkout.</li>
            <li><strong>Fast Dispatch:</strong> We coordinate with nationwide couriers to ensure items arrive at your doorstep in perfect condition.</li>
          </ul>

          <h2 className="text-xl font-bold text-text pt-4">Our Tech Stack</h2>
          <p>
            This storefront is powered by **Next.js 16** with **Tailwind CSS v4** and connected to a headless **Medusa v2** server. Transactions are validated and secured using native Safaricom Daraja Webhooks and Paystack card authorization layers.
          </p>
        </div>
      </div>
    </div>
  )
}
