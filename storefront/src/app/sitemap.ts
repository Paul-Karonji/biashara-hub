import { MetadataRoute } from "next"
import { medusa } from "@/lib/medusa"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://biasharahub.co.ke"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/offers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/returns`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  try {
    // Dynamic product pages
    const { products } = await medusa.store.product.list({ limit: 500 })
    const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${baseUrl}/p/${product.handle}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Dynamic category pages
    const { product_categories } = await medusa.store.category.list({ limit: 100 })
    const categoryPages: MetadataRoute.Sitemap = (product_categories || []).map((cat) => ({
      url: `${baseUrl}/c/${cat.handle}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))

    return [...staticPages, ...productPages, ...categoryPages]
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries:", error)
    return staticPages
  }
}
