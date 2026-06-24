export const DARAJA_BASE_URL = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
}

export const DARAJA_ENDPOINTS = {
  token: '/oauth/v1/generate?grant_type=client_credentials',
  stkPush: '/mpesa/stkpush/v1/processrequest',
  stkQuery: '/mpesa/stkpushquery/v1/query',
  c2bRegister: '/mpesa/c2b/v2/registerurl',
}
