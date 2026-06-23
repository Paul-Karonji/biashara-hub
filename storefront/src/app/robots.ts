import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block private/transactional routes from being indexed
        disallow: ["/checkout", "/cart", "/account", "/order/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_STORE_URL || "https://biasharahub.co.ke"}/sitemap.xml`,
  }
}
