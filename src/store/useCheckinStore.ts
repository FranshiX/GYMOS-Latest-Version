import { create } from 'zustand'
import type { CheckIn } from '@/domain/checkin/types'
import type { CheckInResult } from '@/domain/membership/types'
import checkinsData from '@/data/checkins.json'
import { processCheckIn } from '@/domain/checkin/checkinLogic'
import { useMemberStore } from './useMemberStore'
import { useMembershipStore } from './useMembershipStore'

export interface CheckinStore {
  checkins: CheckIn[]
  lastResult: CheckInResult | null
  lastCheckin: CheckIn | null
  isProcessing: boolean
  loadCheckins: () => void
  processCheckInByPhone: (phone: string) => void
  clearLastResult: () => void
}

export const useCheckinStore = create<CheckinStore>((set: any) => ({
  checkins: [],
  lastResult: null,
  lastCheckin: null,
  isProcessing: false,

  loadCheckins: () => {
    set({ checkins: checkinsData as CheckIn[] })
  },

  processCheckInByPhone: (phone: string) => {
    set({ isProcessing: true })

    const members     = useMemberStore.getState().members
    const member      = members.find((m: any) => m.phone === phone)

    if (!member) {
      const denied: CheckIn = {
        id:          crypto.randomUUID(),
        memberId:    'unknown',
        timestamp:   new Date().toISOString(),
        result:      'DENIED',
        stampsAfter: 0,
      }
      set((state: CheckinStore) => ({
        checkins:     [denied, ...state.checkins],
        lastResult:   'DENIED',
        lastCheckin:  denied,
        isProcessing: false,
      }))
      return
    }

    const membership = useMembershipStore.getState().getActiveMembership(
      member.id,
      member.activeMembershipId
    )

    if (!membership) {
      const denied: CheckIn = {
        id:          crypto.randomUUID(),
        memberId:    member.id,
        timestamp:   new Date().toISOString(),
        result:      'DENIED',
        stampsAfter: 0,
      }
      set((state: CheckinStore) => ({
        checkins:     [denied, ...state.checkins],
        lastResult:   'DENIED',
        lastCheckin:  denied,
        isProcessing: false,
      }))
      return
    }

    const { result, checkin, updatedMembership } = processCheckIn(membership, member.id)

    if (result === 'GRANTED') {
      useMembershipStore.getState().consumeStamp(updatedMembership.id)
    }

    set((state: CheckinStore) => ({
      checkins:     [checkin, ...state.checkins],
      lastResult:   result,
      lastCheckin:  checkin,
      isProcessing: false,
    }))
  },

  clearLastResult: () => set({ lastResult: null, lastCheckin: null }),
}))