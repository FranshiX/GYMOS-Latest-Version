import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { BodyMeasurement } from '../domain/measurement/types'
import measurementsData from '../data/measurements.json'

interface MeasurementStore {
  measurements: BodyMeasurement[]

  // Getters
  getMeasurementsForMember: (memberId: string) => BodyMeasurement[]
  getLatestMeasurement: (memberId: string) => BodyMeasurement | undefined
  getWeightProgress: (memberId: string) => { date: string; weight: number }[]

  // Mutations
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void
  updateMeasurement: (id: string, updates: Partial<BodyMeasurement>) => void
  deleteMeasurement: (id: string) => void
}

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set: any, get: any) => ({
      measurements: measurementsData as BodyMeasurement[],

      getMeasurementsForMember: (memberId: string) =>
        get()
          .measurements.filter((m: BodyMeasurement) => m.memberId === memberId)
          .sort((a: BodyMeasurement, b: BodyMeasurement) => a.date.localeCompare(b.date)),

      getLatestMeasurement: (memberId: string) => {
        const list = get().getMeasurementsForMember(memberId)
        return list[list.length - 1]
      },

      getWeightProgress: (memberId: string) =>
        get()
          .getMeasurementsForMember(memberId)
          .filter((m: BodyMeasurement) => m.weight !== undefined)
          .map((m: BodyMeasurement) => ({ date: m.date, weight: m.weight! })),

      addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => {
        const newMeasurement: BodyMeasurement = {
          ...measurement,
          id: `meas_${Date.now()}`,
        }
        set((s: MeasurementStore) => ({ measurements: [...s.measurements, newMeasurement] }))
      },

      updateMeasurement: (id: string, updates: Partial<BodyMeasurement>) => {
        set((s: MeasurementStore) => ({
          measurements: s.measurements.map((m: BodyMeasurement) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
      },

      deleteMeasurement: (id: string) => {
        set((s: MeasurementStore) => ({ measurements: s.measurements.filter((m: BodyMeasurement) => m.id !== id) }))
      },
    }),
    {
      name: 'gymos-measurements',
      storage: createJSONStorage(() => localStorage),
    }
  )
)