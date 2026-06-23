import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"


export default async function syncMeilisearch({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  logger.info("Initializing manual MeiliSearch sync...")
  
  // 1. Fetch all products from Medusa DB using query graph
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "description",
      "handle",
      "thumbnail",
      "tags.value",
      "categories.name"
    ]
  })
  
  logger.info(`Found ${products.length} products in database.`)
  
  if (products.length === 0) {
    logger.info("No products found to index.")
    return
  }
  
  // 2. Initialize MeiliSearch client using environment variables
  const host = process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700"
  const apiKey = process.env.MEILISEARCH_KEY || "masterKey"
  
  const { Meilisearch } = await import("meilisearch")
  const client = new Meilisearch({
    host,
    apiKey,
  })
  
  const index = client.index("products")
  
  // 3. Format products to match index expectation
  const documents = products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    handle: product.handle,
    thumbnail: product.thumbnail,
    tags: product.tags?.map((t: any) => t.value) || [],
    categories: product.categories?.map((c: any) => c.name) || [],
  }))
  
  // 4. Push documents to MeiliSearch
  logger.info("Uploading products to MeiliSearch index 'products'...")
  const response = await index.addDocuments(documents)
  logger.info(`MeiliSearch task response: ${JSON.stringify(response)}`)
  logger.info("MeiliSearch manual sync completed successfully!")
}
