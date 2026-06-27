import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Member } from '@/domain/member/types'
import membersData from '@/data/members.json'

export interface MemberStore {
  members: Member[]
  selectedMember: Member | null
  loadMembers: () => void
  selectMember: (id: string) => void
  clearSelection: () => void
  addMember: (member: Member) => void
  updateActiveMembership: (memberId: string, membershipId: string) => void
}

export const useMemberStore = create(
  persist<MemberStore>(
    (set: any, get: any) => ({
      members: membersData as Member[],
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
        set((state: MemberStore) => {
          const members = state.members.map((m: Member) =>
            m.id === memberId
              ? { ...m, activeMembershipId: membershipId }
              : m
          )
          const selectedMember = state.selectedMember && state.selectedMember.id === memberId
            ? members.find(m => m.id === memberId) ?? null
            : state.selectedMember
          return { members, selectedMember }
        })
      }, 
    }),
    {
      name: 'gymos-members',
      storage: createJSONStorage(() => localStorage),
    }
  )
)