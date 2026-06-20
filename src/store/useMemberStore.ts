import { create } from 'zustand'
import type { Member } from '@/domain/member/types'
import membersData from '@/data/members.json'

interface MemberStore {
  members: Member[]
  selectedMember: Member | null
  loadMembers: () => void
  selectMember: (id: string) => void
  clearSelection: () => void
  addMember: (member: Member) => void
  updateActiveMembership: (memberId: string, membershipId: string) => void
}

export const useMemberStore = create<MemberStore>((set: any, get: any) => ({
  members: [],
  selectedMember: null,

  loadMembers: () => {
    set({ members: membersData as Member[] })
  },

  selectMember: (id: string) => {
    const found = get().members.find((m: Member) => m.id === id) ?? null
    set({ selectedMember: found })
  },

  clearSelection: () => set({ selectedMember: null }),

  addMember: (member: Member) => {
    set((state: MemberStore) => ({ members: [...state.members, member] }))
  },

  updateActiveMembership: (memberId: string, membershipId: string) => {
    set((state: MemberStore) => ({
      members: state.members.map((m: Member) =>
        m.id === memberId
          ? { ...m, activeMembershipId: membershipId }
          : m
      ),
    }))
  },
}))