import type { Membership, CheckInResult } from '@/domain/membership/types'
import type { CheckIn } from './types'
import { canCheckIn, getStampsBalance } from '@/domain/membership/membershipLogic'

export function processCheckIn(
  membership: Membership,
  memberId: string,
): { result: CheckInResult; checkin: CheckIn; updatedMembership: Membership } {
  const granted = canCheckIn(membership)
  const balance = getStampsBalance(membership)

  const checkin: CheckIn = {
    id:          crypto.randomUUID(),
    memberId,
    timestamp:   new Date().toISOString(),
    result:      granted ? 'GRANTED' : 'DENIED',
    stampsAfter: granted ? balance.remaining - 1 : balance.remaining,
  }

  const updatedMembership: Membership = granted
    ? { ...membership, stampsUsed: membership.stampsUsed + 1 }
    : membership

  return {
    result: granted ? 'GRANTED' : 'DENIED',
    checkin,
    updatedMembership,
  }
}