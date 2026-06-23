import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ModuleRegistrationName } from "@medusajs/framework/utils";

export default async function seed_promotions({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const promotionModuleService = container.resolve(ModuleRegistrationName.PROMOTION);

  logger.info("Seeding test promotions...");

  try {
    const promotion = await promotionModuleService.createPromotions({
      code: "WELCOME10",
      type: "standard",
      is_automatic: false,
      status: "active",
      application_method: {
        value: 10,
        type: "percentage",
        target_type: "order",
        allocation: "across",
      },
    });

    logger.info(`Successfully seeded promotion: ${promotion.code} (${promotion.id})`);
  } catch (error) {
    logger.error(`Failed to seed promotion: ${error.message}`);
  }
}
