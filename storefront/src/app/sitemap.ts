import { MetadataRoute } from "next"
import { medusa } from "@/lib/medusa"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://biasharahub.co.ke"

  // Static pages — always included, even if the backend is unreachable
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/offers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  // Fetch dynamic pages independently — a failure in one does not block the other
  const [productPages, categoryPages] = await Promise.all([
    medusa.store.product
      .list({ limit: 500 })
      .then(({ products }) =>
        (products || []).map((product) => ({
          url: `${baseUrl}/p/${product.handle}`,
          lastModified: new Date(product.updated_at || new Date()),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
      )
      .catch((err) => {
        console.error("[Sitemap] Failed to fetch products:", err?.message ?? err)
        return [] as MetadataRoute.Sitemap
      }),

    medusa.store.category
      .list({ limit: 100 })
      .then(({ product_categories }) =>
        (product_categories || []).map((cat) => ({
          url: `${baseUrl}/c/${cat.handle}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.7,
        }))
      )
      .catch((err) => {
        console.error("[Sitemap] Failed to fetch categories:", err?.message ?? err)
        return [] as MetadataRoute.Sitemap
      }),
  ])

  return [...staticPages, ...productPages, ...categoryPages]
}
