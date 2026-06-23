"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail } from "lucide-react"
import { medusa } from "@/lib/medusa"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Login customer using Medusa SDK auth
      await medusa.auth.login("customer", "emailpass", {
        email,
        password,
      })

      // Redirect to account dashboard
      router.push("/account")
      router.refresh()
    } catch (error: any) {
      console.error("Login failed:", error)
      setErrorMessage("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-background py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-gold tracking-widest uppercase">Welcome Back</span>
          <h1 className="text-2xl font-extrabold text-text tracking-tight">Customer Login</h1>
          <p className="text-xs text-muted">Sign in to track orders and save shipping addresses.</p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-text">Password</label>
            </div>
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 h-12 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Lock size={18} className="text-muted flex-shrink-0" />
              <input
                type="password"
                required
                placeholder="Enter your password"
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
