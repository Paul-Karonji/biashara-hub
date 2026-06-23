import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | Biashara Hub",
  description: "Read the terms of service for utilizing the Biashara Hub platform.",
}

export default function TermsPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-8">
        <div>
          <span className="text-xs font-bold text-gold tracking-widest uppercase">Legal</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-text mt-1 tracking-tight">Terms &amp; Conditions</h1>
        </div>

        <div className="prose prose-slate max-w-none text-muted text-sm md:text-base leading-relaxed space-y-6">
          <p>
            Please read these terms and conditions carefully before using our website operated by Biashara Hub.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">1. Conditions of Use</h2>
          <p>
            By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly. Biashara Hub only grants use and access of this website, its products, and its services to those who have accepted its terms.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">2. Intellectual Property</h2>
          <p>
            You agree that all materials, products, and services provided on this website are the property of Biashara Hub, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">3. User Accounts</h2>
          <p>
            As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. You are also responsible for all activities that occur under your account or password.
          </p>

          <h2 className="text-xl font-bold text-text pt-4">4. Payments &amp; Deliveries</h2>
          <p>
            Payments are collected locally through Safaricom M-Pesa STK prompts or debit cards. You agree to provide a valid phone number and authorize transactions. Deliveries are carried out by third-party logistics firms. We do our best to deliver within 2-4 business days but cannot guarantee exact time frames due to weather or courier delays.
          </p>
        </div>
      </div>
    </div>
  )
}
