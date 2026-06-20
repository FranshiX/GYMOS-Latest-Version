export type MemberStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
export type CheckInResult = 'GRANTED' | 'DENIED'

export interface Membership {
  id: string
  memberId: string
  planId: string
  startDate: string
  endDate: string
  stampsTotal: number
  stampsUsed: number
  paymentId: string
}

export interface StampBalance {
  total: number
  used: number
  remaining: number
}

export interface DateRange {
  startDate: string
  endDate: string
  daysLeft: number
}