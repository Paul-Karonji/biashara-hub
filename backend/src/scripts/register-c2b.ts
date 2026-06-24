import { registerC2BUrls } from '../modules/mpesa/c2b'

export default async function runScript() {
  console.log('Running C2B URLs registration script...')
  try {
    const result = await registerC2BUrls()
    console.log('Successfully registered C2B URLs:', result)
  } catch (error: any) {
    console.error('Failed to register C2B URLs:', error.message)
  }
}
