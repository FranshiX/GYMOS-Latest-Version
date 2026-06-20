export type PaymentType = 'NEW' | 'RENEWAL'

export interface Payment {
  id: string
  memberId: string
  amount: number
  date: string
  type: PaymentType
}