"use client"

import React from "react"
import { Headphones } from "lucide-react"

export function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Support ticket submitted successfully! Our team will contact you shortly.")
  }

  return (
    <div className="bg-white rounded-md border border-border p-6 md:p-8 space-y-6">
      <h2 className="text-text font-bold text-lg font-serif">Send Us a Message</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text">Full Name</label>
          <input
            type="text"
            required
            placeholder="Enter your name"
            className="w-full h-12 px-4 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text">Email Address</label>
          <input
            type="email"
            required
            placeholder="name@domain.com"
            className="w-full h-12 px-4 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text">How can we help?</label>
          <textarea
            required
            rows={4}
            placeholder="Describe your issue or question here..."
            className="w-full p-4 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-navy text-white text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Headphones size={16} />
          Submit Ticket
        </button>
      </form>
    </div>
  )
}
