import type { Membership, MemberStatus, StampBalance, DateRange } from './types'

export function getStampsBalance(m: Membership): StampBalance {
  return {
    total:     m.stampsTotal,
    used:      m.stampsUsed,
    remaining: m.stampsTotal - m.stampsUsed,
  }
}

export function getDateRange(m: Membership): DateRange {
  const today    = new Date()
  const end      = new Date(m.endDate)
  const diffMs   = end.getTime() - today.getTime()
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  return {
    startDate: m.startDate,
    endDate:   m.endDate,
    daysLeft,
  }
}

export function computeStatus(m: Membership): MemberStatus {
  const today     = new Date()
  const end       = new Date(m.endDate)
  const remaining = m.stampsTotal - m.stampsUsed
  const { daysLeft } = getDateRange(m)

  if (today > end)       return 'EXPIRED'
  if (remaining <= 0)    return 'EXPIRED'
  if (daysLeft <= 7)     return 'EXPIRING_SOON'
  if (remaining <= 5)    return 'EXPIRING_SOON'

  return 'ACTIVE'
}

export function canCheckIn(m: Membership): boolean {
  return computeStatus(m) !== 'EXPIRED'
}