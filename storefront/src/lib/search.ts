import { Meilisearch } from "meilisearch"

export const searchClient = new Meilisearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://127.0.0.1:7700",
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY || "masterKey",
})

export async function searchProducts(query: string, limit = 20) {
  try {
    const index = searchClient.index("products")
    const results = await index.search(query, {
      limit,
      attributesToHighlight: ["title", "description"],
    })
    return results.hits || []
  } catch (error) {
    console.error("MeiliSearch query failed:", error)
    return []
  }
}
