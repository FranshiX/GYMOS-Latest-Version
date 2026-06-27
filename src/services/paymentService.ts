import paymentsData from '@/data/payments.json'
import type { Payment } from '@/domain/payment/types'

export const paymentService = {
  getAll: (): Payment[] => paymentsData as Payment[],
}
