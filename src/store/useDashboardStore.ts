import { useMemberStore } from './useMemberStore'
import { useMembershipStore } from './useMembershipStore'
import { useCheckinStore } from './useCheckinStore'
import { computeStatus } from '@/domain/membership/membershipLogic'

export function useDashboardStats() {
  const members     = useMemberStore((s: any) => s.members)
  const memberships = useMembershipStore((s: any) => s.memberships)
  const checkins    = useCheckinStore((s: any) => s.checkins)

  const today = new Date().toISOString().split('T')[0]

  const totalMembers = members.length

  const statusMap = new Map(
    memberships.map((ms: any) => [ms.memberId, computeStatus(ms)])
  )

  const activeMembers   = [...statusMap.values()].filter(s => s === 'ACTIVE').length
  const expiringMembers = [...statusMap.values()].filter(s => s === 'EXPIRING_SOON').length
  const expiredMembers  = [...statusMap.values()].filter(s => s === 'EXPIRED').length

  const todayCheckins = checkins.filter((c: any) =>
    c.timestamp.startsWith(today) && c.result === 'GRANTED'
  ).length

  const revenueToday = 0

  const revenueThisMonth = 0

  const expiringList = memberships
    .filter((ms: any) => computeStatus(ms) === 'EXPIRING_SOON')
    .map((ms: any) => {
      const member = members.find((m: any) => m.activeMembershipId === ms.id)
      return { membership: ms, member }
    })
    .filter((item: any) => item.member !== undefined)

  return {
    totalMembers,
    activeMembers,
    expiringMembers,
    expiredMembers,
    todayCheckins,
    revenueToday,
    revenueThisMonth,
    expiringList,
  }
}