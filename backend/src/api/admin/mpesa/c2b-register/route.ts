import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { registerC2BUrls } from '../../../../modules/mpesa/c2b'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const result = await registerC2BUrls()
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('Error registering C2B URLs:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to register C2B URLs with Safaricom.',
    })
  }
}
