import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function check_seed_data({
  container,
}: {
  container: MedusaContainer;
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Checking seeded database data...");
  
  // 0. Check API Keys
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token", "type"],
  });
  logger.info(`API Keys found: ${apiKeys.length}`);
  apiKeys.forEach(k => logger.info(`- API Key: ${k.title} (${k.token}) [${k.type}]`));

  // 1. Check Regions
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });
  logger.info(`Regions found: ${regions.length}`);
  regions.forEach(r => logger.info(`- Region: ${r.name} (${r.currency_code})`));

  // 2. Check Product Categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  });
  logger.info(`Product Categories found: ${categories.length}`);
  categories.forEach(c => logger.info(`- Category: ${c.name} (${c.handle})`));

  // 3. Check Products
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
  });
  logger.info(`Products found: ${products.length}`);
  products.forEach(p => logger.info(`- Product: ${p.title} (${p.handle})`));

  // 4. Check Shipping Options
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "price_type"],
  });
  logger.info(`Shipping Options found: ${shippingOptions.length}`);
  shippingOptions.forEach(s => logger.info(`- Shipping Option: ${s.name} (${s.price_type})`));

  // 5. Check Promotions
  const { data: promotions } = await query.graph({
    entity: "promotion",
    fields: ["id", "code", "type"],
  });
  logger.info(`Promotions found: ${promotions.length}`);
  promotions.forEach(pr => logger.info(`- Promotion: ${pr.code} (${pr.type})`));
}
