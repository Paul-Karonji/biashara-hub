import React from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import { ContactForm } from "@/components/shared/ContactForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Biashara Hub",
  description: "Get in touch with Biashara Hub support. We are based on Mombasa Road in Nairobi, Kenya and provide 24/7 client support.",
}

export default function ContactPage() {
  return (
    <div className="flex-1 bg-background py-16 md:py-24">
      <div className="max-w-[1000px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Info Col */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-gold tracking-widest uppercase">Support Center</span>
            <h1 className="text-3xl font-extrabold text-text mt-1 tracking-tight">Get In Touch</h1>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              Have questions about an order, payment, or delivery? Our Nairobi-based support team is here to assist you 24/7.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-5 bg-white border border-border rounded-md">
              <div className="w-10 h-10 rounded-md bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs uppercase tracking-wider">Call or WhatsApp</h4>
                <p className="text-sm font-semibold text-primary mt-1">+254 700 000 000</p>
                <p className="text-[10px] text-muted mt-0.5">Mon - Sun: 24/7 Support line</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white border border-border rounded-md">
              <div className="w-10 h-10 rounded-md bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs uppercase tracking-wider">Email Us</h4>
                <p className="text-sm font-semibold text-primary mt-1 font-mono">support@biasharahub.co.ke</p>
                <p className="text-[10px] text-muted mt-0.5">Expect replies in under 1 hour</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white border border-border rounded-md">
              <div className="w-10 h-10 rounded-md bg-gold-light/20 flex items-center justify-center text-gold flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-text font-bold text-xs uppercase tracking-wider">Our Office</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Mombasa Road, Nairobi, Kenya<br />
                  P.O Box 00100 GPO Nairobi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Mockup Col */}
        <ContactForm />

      </div>
    </div>
  )
}
