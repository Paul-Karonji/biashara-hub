"use client"

import React, { useEffect } from "react"
import posthog from "posthog-js"

interface CSPostHogProviderProps {
  children: React.ReactNode
}

export function CSPostHogProvider({ children }: CSPostHogProviderProps) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

    if (key) {
      console.log("[PostHog] Initializing tracking client...")
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: false, // Pageviews are manual or router-based to avoid duplicate triggers in SSR
        capture_pageleave: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === "development") {
            ph.debug() // Enable debug logging in dev environment
          }
        }
      })
    } else {
      console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY is missing. Analytics tracking will fall back to local logging.")
    }
  }, [])

  return <>{children}</>
}
