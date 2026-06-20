import { create } from 'zustand'
import { WorkoutPlan, WorkoutDay, WorkoutExercise } from '../domain/workout/types'
import plansData from '../data/workoutPlans.json'

interface WorkoutPlanStore {
  plans: WorkoutPlan[]

  // Plans
  addPlan: (plan: Omit<WorkoutPlan, 'id' | 'days'>) => WorkoutPlan
  updatePlan: (id: string, updates: Partial<Omit<WorkoutPlan, 'id'>>) => void
  deletePlan: (id: string) => void
  duplicatePlan: (id: string) => WorkoutPlan | null
  getPlanById: (id: string) => WorkoutPlan | undefined
  getPlansForMember: (memberId: string) => WorkoutPlan[]
  getGeneralPlans: () => WorkoutPlan[]

  // Days
  addDay: (planId: string, day: Omit<WorkoutDay, 'id' | 'exercises'>) => void
  updateDay: (planId: string, dayId: string, updates: Partial<WorkoutDay>) => void
  deleteDay: (planId: string, dayId: string) => void
  reorderDays: (planId: string, dayIds: string[]) => void

  // Exercises within a day
  addExerciseToDay: (planId: string, dayId: string, ex: Omit<WorkoutExercise, 'id'>) => void
  updateExerciseInDay: (planId: string, dayId: string, exId: string, updates: Partial<WorkoutExercise>) => void
  removeExerciseFromDay: (planId: string, dayId: string, exId: string) => void
  reorderExercisesInDay: (planId: string, dayId: string, exIds: string[]) => void
}

export const useWorkoutPlanStore = create<WorkoutPlanStore>((set: any, get: any) => ({
  plans: plansData as WorkoutPlan[],

  // ── Plans ──────────────────────────────────────────────
  addPlan: (plan: Omit<WorkoutPlan, 'id' | 'days'>) => {
    const newPlan: WorkoutPlan = { ...plan, id: `plan_${Date.now()}`, days: [] }
    set((s: WorkoutPlanStore) => ({ plans: [...s.plans, newPlan] }))
    return newPlan
  },

  updatePlan: (id: string, updates: Partial<Omit<WorkoutPlan, 'id'>>) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  },

  deletePlan: (id: string) => {
    set((s: WorkoutPlanStore) => ({ plans: s.plans.filter((p: WorkoutPlan) => p.id !== id) }))
  },

  duplicatePlan: (id: string) => {
    const original = get().plans.find((p: WorkoutPlan) => p.id === id)
    if (!original) return null

    // Deep copy days with new IDs
    const copiedDays: WorkoutDay[] = original.days.map((day: WorkoutDay) => ({
      ...day,
      id: `day_${Date.now()}_${Math.random()}`,
      // Deep copy exercises with new IDs
      exercises: day.exercises.map((ex: WorkoutExercise) => ({
        ...ex,
        id: `we_${Date.now()}_${Math.random()}`,
      })),
    }))

    const newPlan: WorkoutPlan = {
      ...original,
      id: `plan_${Date.now()}`,
      name_ar: `${original.name_ar} (نسخة)`,
      name_en: `${original.name_en} (Copy)`,
      type: 'GENERAL', // Always default to General type
      assignedMemberId: undefined, // Clear assignment
      days: copiedDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((s: WorkoutPlanStore) => ({ plans: [...s.plans, newPlan] }))
    return newPlan
  },

  getPlanById: (id: string) => get().plans.find((p: WorkoutPlan) => p.id === id),

  getPlansForMember: (memberId: string) =>
    get().plans.filter(
      (p: WorkoutPlan) => p.type === 'CUSTOM' && p.assignedMemberId === memberId
    ),

  getGeneralPlans: () => get().plans.filter((p: WorkoutPlan) => p.type === 'GENERAL'),

  // ── Days ───────────────────────────────────────────────
  addDay: (planId: string, day: Omit<WorkoutDay, 'id' | 'exercises'>) => {
    const newDay: WorkoutDay = { ...day, id: `day_${Date.now()}`, exercises: [] }
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) =>
        p.id === planId ? { ...p, days: [...p.days, newDay] } : p
      ),
    }))
  },

  updateDay: (planId: string, dayId: string, updates: Partial<WorkoutDay>) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) =>
        p.id === planId
          ? {
              ...p,
              days: p.days.map((d: WorkoutDay) => (d.id === dayId ? { ...d, ...updates } : d)),
            }
          : p
      ),
    }))
  },

  deleteDay: (planId: string, dayId: string) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) =>
        p.id === planId
          ? { ...p, days: p.days.filter((d: WorkoutDay) => d.id !== dayId) }
          : p
      ),
    }))
  },

  reorderDays: (planId: string, dayIds: string[]) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) => {
        if (p.id !== planId) return p
        const ordered = dayIds
          .map((id: string) => p.days.find((d: WorkoutDay) => d.id === id))
          .filter(Boolean) as WorkoutDay[]
        return { ...p, days: ordered }
      }),
    }))
  },

  // ── Exercises within Day ───────────────────────────────
  addExerciseToDay: (planId: string, dayId: string, ex: Omit<WorkoutExercise, 'id'>) => {
    const newEx: WorkoutExercise = { ...ex, id: `we_${Date.now()}` }
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) =>
        p.id === planId
          ? {
              ...p,
              days: p.days.map((d: WorkoutDay) =>
                d.id === dayId
                  ? { ...d, exercises: [...d.exercises, newEx] }
                  : d
              ),
            }
          : p
      ),
    }))
  },

  updateExerciseInDay: (planId: string, dayId: string, exId: string, updates: Partial<WorkoutExercise>) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) =>
        p.id === planId
          ? {
              ...p,
              days: p.days.map((d: WorkoutDay) =>
                d.id === dayId
                  ? {
                      ...d,
                      exercises: d.exercises.map((e: WorkoutExercise) =>
                        e.id === exId ? { ...e, ...updates } : e
                      ),
                    }
                  : d
              ),
            }
          : p
      ),
    }))
  },

  removeExerciseFromDay: (planId: string, dayId: string, exId: string) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) =>
        p.id === planId
          ? {
              ...p,
              days: p.days.map((d: WorkoutDay) =>
                d.id === dayId
                  ? { ...d, exercises: d.exercises.filter((e: WorkoutExercise) => e.id !== exId) }
                  : d
              ),
            }
          : p
      ),
    }))
  },

  reorderExercisesInDay: (planId: string, dayId: string, exIds: string[]) => {
    set((s: WorkoutPlanStore) => ({
      plans: s.plans.map((p: WorkoutPlan) => {
        if (p.id !== planId) return p
        return {
          ...p,
          days: p.days.map((d: WorkoutDay) => {
            if (d.id !== dayId) return d
            const ordered = exIds
              .map((id: string) => d.exercises.find((e: WorkoutExercise) => e.id === id))
              .filter(Boolean) as WorkoutExercise[]
            return { ...d, exercises: ordered }
          }),
        }
      }),
    }))
  },
}))