import React from "react"
import { MapPin, Phone, Clock, Compass } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Store Locator & Warehouse | Biashara Hub",
  description: "Find the Biashara Hub main warehousing facility on Mombasa Road in Nairobi, Kenya. Contact details and pickup terms.",
}

export default function StoreLocatorPage() {
  return (
    <div className="flex-1 bg-white py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold text-gold tracking-widest uppercase font-sans">
            Find Us
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-semibold text-text mt-1 tracking-tight">
            Our Warehouses & Offices
          </h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto leading-relaxed font-sans">
            Biashara Hub operates as a modern digital storefront. All orders are packed and dispatched from our primary Mombasa Road warehousing depot.
          </p>
        </div>

        {/* Info card */}
        <div className="p-6 md:p-8 bg-surface border border-border rounded-md grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Compass size={20} className="text-primary" />
              <h2 className="text-base font-bold text-text font-serif">Central Nairobi Fulfillment Depot</h2>
            </div>
            
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs text-text font-sans">
                <MapPin size={18} className="text-gold flex-shrink-0" />
                <span>
                  <strong>Biashara Hub Logistics Yard</strong>
                  <br />Mombasa Road, Opp. Sameer Business Park
                  <br />Nairobi, Kenya
                </span>
              </li>
              <li className="flex gap-3 text-xs text-text font-sans">
                <Clock size={18} className="text-gold flex-shrink-0" />
                <span>
                  <strong>Working Hours</strong>
                  <br />Monday - Friday: 8:00 AM - 6:00 PM
                  <br />Saturday: 9:00 AM - 4:00 PM
                  <br />Sunday: Closed (Online orders open)
                </span>
              </li>
              <li className="flex gap-3 text-xs text-text font-sans">
                <Phone size={18} className="text-gold flex-shrink-0" />
                <span>
                  <strong>Direct Line</strong>
                  <br />+254 700 000 000
                </span>
              </li>
            </ul>
          </div>

          {/* Pickup terms */}
          <div className="p-5 bg-white border border-border rounded-md space-y-4">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider font-sans">Self-Pickup terms</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Currently, we operate exclusively via door-to-door delivery couriers to streamline logistics. Self-pickup from the warehouse is restricted to wholesale/bulk orders and requires a pre-arranged schedule with our customer care desk.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              For any help or wholesale scheduling, feel free to drop an email to <span className="font-semibold text-primary font-mono">support@biasharahub.co.ke</span> or call us directly.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
