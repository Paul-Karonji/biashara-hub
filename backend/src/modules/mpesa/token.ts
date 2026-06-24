import axios from 'axios'
import { DARAJA_BASE_URL, DARAJA_ENDPOINTS } from './constants'

interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

export async function getAccessToken(): Promise<string> {
  // Check if token exists and is still valid (using 60 seconds safety margin)
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET) are not set in the environment variables.')
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  const baseUrl = DARAJA_BASE_URL[env]

  try {
    const response = await axios.get(`${baseUrl}${DARAJA_ENDPOINTS.token}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    const { access_token, expires_in } = response.data
    
    // expires_in is in seconds. Deduct 60 seconds as a safety buffer.
    tokenCache = {
      token: access_token,
      expiresAt: Date.now() + (parseInt(expires_in, 10) - 60) * 1000,
    }

    return access_token
  } catch (error: any) {
    const errorMsg = error.response?.data || error.message
    console.error('Failed to retrieve M-Pesa access token:', errorMsg)
    throw new Error(`M-Pesa Auth Error: ${JSON.stringify(errorMsg)}`)
  }
}
