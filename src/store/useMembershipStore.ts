import { create } from 'zustand'
import type { Membership } from '@/domain/membership/types'
import membershipsData from '@/data/memberships.json'

interface MembershipStore {
  memberships: Membership[]
  loadMemberships: () => void
  getMembershipById: (id: string) => Membership | undefined
  getActiveMembership: (memberId: string, activeMembershipId: string | null) => Membership | undefined
  consumeStamp: (membershipId: string) => void
  addMembership: (membership: Membership) => void
}

export const useMembershipStore = create<MembershipStore>((set: any, get: any) => ({
  memberships: [],

  loadMemberships: () => {
    set({ memberships: membershipsData as Membership[] })
  },

  getMembershipById: (id: string) => {
    return get().memberships.find((m: Membership) => m.id === id)
  },

  getActiveMembership: (memberId: string, activeMembershipId: string | null) => {
    if (!activeMembershipId) return undefined
    return get().memberships.find(
      (m: Membership) => m.id === activeMembershipId && m.memberId === memberId
    )
  },

  consumeStamp: (membershipId: string) => {
    set((state: MembershipStore) => ({
      memberships: state.memberships.map((m: Membership) =>
        m.id === membershipId
          ? { ...m, stampsUsed: m.stampsUsed + 1 }
          : m
      ),
    }))
  },

  addMembership: (membership: Membership) => {
    set((state: MembershipStore) => ({ memberships: [...state.memberships, membership] }))
  },
}))