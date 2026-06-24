import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log('Received M-Pesa C2B Validation payload:', JSON.stringify(req.body))
  
  // Default behavior is to accept the transaction.
  // Can be extended to reject if amount exceeds limit, number is blacklisted, etc.
  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: 'Accepted',
  })
}
