import { Module } from '@medusajs/framework/utils'
import MpesaModuleService from './service'

export const MPESA_MODULE = 'mpesa'

export default Module(MPESA_MODULE, {
  service: MpesaModuleService,
})
