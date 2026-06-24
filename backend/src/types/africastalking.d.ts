/**
 * Africa's Talking SDK type declarations.
 *
 * The `africastalking` npm package ships without TypeScript definitions.
 * Rather than suppressing the error with @ts-ignore (which hides all future
 * type errors in the import chain), we declare the minimal surface we use.
 *
 * If the AT SDK ever ships official types, remove this file and install them:
 *   pnpm add -D @types/africastalking
 */
declare module 'africastalking' {
  interface SMSSendOptions {
    to: string[]
    message: string
    from?: string
  }

  interface SMSSendRecipient {
    number: string
    statusCode: number
    status: string
    cost: string
    messageId: string
  }

  interface SMSSendResponse {
    SMSMessageData: {
      Message: string
      Recipients: SMSSendRecipient[]
    }
  }

  interface SMSService {
    send(options: SMSSendOptions): Promise<SMSSendResponse>
  }

  interface AfricasTalkingInstance {
    SMS: SMSService
  }

  interface AfricasTalkingOptions {
    apiKey: string
    username: string
  }

  function AfricasTalking(options: AfricasTalkingOptions): AfricasTalkingInstance
  export = AfricasTalking
}
