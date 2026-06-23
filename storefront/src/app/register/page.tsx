"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, Smartphone } from "lucide-react"
import { medusa } from "@/lib/medusa"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Step 1: Register in Auth Identity
      const authResponse: any = await medusa.auth.register("customer", "emailpass", {
        email,
        password,
      })

      const token = authResponse.token

      // Step 2: Create Customer record using the registration token
      await medusa.store.customer.create(
        {
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
        },
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      )

      // Step 3: Login automatically to establish session cookies
      await medusa.auth.login("customer", "emailpass", {
        email,
        password,
      })

      // Redirect to account dashboard
      router.push("/account")
      router.refresh()
    } catch (error: any) {
      console.error("Registration failed:", error)
      setErrorMessage(
        error.message || "Failed to create account. Email may already be registered."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-background py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-gold tracking-widest uppercase">Start Journey</span>
          <h1 className="text-2xl font-extrabold text-text tracking-tight">Create Account</h1>
          <p className="text-xs text-muted">Join Biashara Hub to enjoy faster M-Pesa checkouts.</p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text">First Name</label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text">Last Name</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text">Email Address</label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 h-12 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Mail size={18} className="text-muted flex-shrink-0" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text text-sm placeholder:text-muted h-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text">Phone Number (Optional)</label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 h-12 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Smartphone size={18} className="text-muted flex-shrink-0" />
              <input
                type="tel"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text text-sm placeholder:text-muted h-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text">Password</label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 h-12 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Lock size={18} className="text-muted flex-shrink-0" />
              <input
                type="password"
                required
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text text-sm placeholder:text-muted h-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-[#0b3175] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
