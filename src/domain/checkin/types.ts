import type { CheckInResult } from '@/domain/membership/types'

export interface CheckIn {
  id: string
  memberId: string
  timestamp: string
  result: CheckInResult
  stampsAfter: number
}