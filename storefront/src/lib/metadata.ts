/**
 * Shared site metadata constants for Biashara Hub.
 *
 * Import `siteMeta` in page-level metadata exports to guarantee consistent
 * `siteName`, `openGraph`, `twitter`, and keyword defaults across all pages
 * without repeating them. Override individual fields per-page as needed.
 *
 * Usage:
 *   import { siteMeta, buildMetadata } from "@/lib/metadata"
 *   export const metadata = buildMetadata({
 *     title: "Shop — Biashara Hub",
 *     description: "Browse all products...",
 *   })
 */

import type { Metadata } from "next"

export const SITE_NAME = "Biashara Hub"
export const SITE_URL = process.env.NEXT_PUBLIC_STORE_URL || "https://biasharahub.co.ke"
export const SITE_DESCRIPTION =
  "Quality products trusted by Kenyans. Native M-Pesa payments, nationwide delivery."

/** Shared Open Graph / Twitter base that every page inherits. */
export const siteMeta = {
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website" as const,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 800,
        height: 200,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    site: "@biasharahub",
  },
  keywords: [
    "Kenya ecommerce",
    "M-Pesa shopping",
    "Buy goods Kenya",
    "Biashara Hub",
    "Online shopping Kenya",
  ],
} satisfies Partial<Metadata>

/**
 * Build a full `Metadata` object by merging page-specific fields with the
 * shared site defaults. Title and description are required so TypeScript
 * catches pages that forget to set them.
 */
export function buildMetadata(
  page: Pick<Metadata, "title" | "description"> & Partial<Metadata>
): Metadata {
  return {
    ...siteMeta,
    ...page,
    openGraph: {
      ...siteMeta.openGraph,
      title: String(page.title ?? SITE_NAME),
      description: page.description ?? SITE_DESCRIPTION,
      ...(page.openGraph ?? {}),
    },
    twitter: {
      ...siteMeta.twitter,
      title: String(page.title ?? SITE_NAME),
      description: page.description ?? SITE_DESCRIPTION,
      ...(page.twitter ?? {}),
    },
  }
}
