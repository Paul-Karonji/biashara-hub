import { MedusaService } from '@medusajs/framework/utils'
import MpesaC2bPayment from './models/c2b-payment'

class MpesaModuleService extends MedusaService({
  MpesaC2bPayment,
}) {
}

export default MpesaModuleService
