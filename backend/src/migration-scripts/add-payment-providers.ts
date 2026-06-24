import { MedusaContainer } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export default async function add_payment_providers({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  
  // Resolve region module service
  let regionModuleService: any
  try {
    regionModuleService = container.resolve('region')
  } catch (err) {
    logger.error('Failed to resolve region module service')
    throw err
  }

  logger.info('Starting migration: Adding payment providers to Kenya region...')

  try {
    // 1. Fetch the Kenya region
    const { data: regions } = await query.graph({
      entity: 'region',
      fields: ['id', 'name', 'payment_providers.id'],
      filters: { name: 'Kenya' },
    })

    if (!regions || regions.length === 0) {
      logger.error('Region "Kenya" not found. Please run the initial data seed first.')
      return
    }

    const region = regions[0]
    const existingProviders = region.payment_providers?.map((p: any) => p.id) || []
    
    // Providers in Medusa v2 are prefixed by pp_{moduleId}_{providerId}
    const targetProviders = ['pp_mpesa_mpesa', 'pp_paystack_paystack', 'pp_system_default']
    const mergedProviders = Array.from(new Set([...existingProviders, ...targetProviders]))

    logger.info(`Existing payment providers: ${JSON.stringify(existingProviders)}`)
    logger.info(`Target payment providers: ${JSON.stringify(mergedProviders)}`)

    // Update the region
    await regionModuleService.updateRegions(region.id, {
      payment_providers: mergedProviders,
    })

    logger.info('Finished migrating region payment providers successfully.')
  } catch (error: any) {
    logger.error(`Error during region payment provider migration: ${error.message}`)
    throw error
  }
}
