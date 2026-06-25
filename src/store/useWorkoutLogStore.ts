import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WorkoutLog, ExerciseLog, SetLog } from '../domain/workoutLog/types'
import logsData from '../data/workoutLogs.json'

interface WorkoutLogStore {
  logs: WorkoutLog[]

  // Getters
  getLogsForMember: (memberId: string) => WorkoutLog[]
  getLogsForPlan: (memberId: string, planId: string) => WorkoutLog[]
  getLogById: (logId: string) => WorkoutLog | undefined
  getTodayLog: (memberId: string, dayId: string) => WorkoutLog | undefined
  getStreakForMember: (memberId: string) => number

  // Mutations
  startLog: (memberId: string, planId: string, dayId: string) => WorkoutLog
  updateSetLog: (
    logId: string,
    exerciseId: string,
    setNumber: number,
    update: Partial<SetLog>
  ) => void
  addExerciseLog: (logId: string, exerciseLog: Omit<ExerciseLog, 'id'>) => void
  finishLog: (logId: string) => void
  deleteLog: (logId: string) => void

  // Progress helpers
  getMaxWeightForExercise: (memberId: string, exerciseId: string) => number
  getWeightProgressForExercise: (
    memberId: string,
    exerciseId: string
  ) => { date: string; maxWeight: number }[]
}

export const useWorkoutLogStore = create<WorkoutLogStore>()(
  persist(
    (set: any, get: any) => ({
      logs: logsData as WorkoutLog[],

      // ── Getters ────────────────────────────────────────────
      getLogsForMember: (memberId: string) =>
        get()
          .logs.filter((l: WorkoutLog) => l.memberId === memberId)
          .sort((a: WorkoutLog, b: WorkoutLog) => b.date.localeCompare(a.date)),

      getLogsForPlan: (memberId: string, planId: string) =>
        get().logs.filter((l: WorkoutLog) => l.memberId === memberId && l.workoutPlanId === planId),

      getLogById: (logId: string) => get().logs.find((l: WorkoutLog) => l.id === logId),

      getTodayLog: (memberId: string, dayId: string) => {
        const today = new Date().toISOString().split('T')[0]
        return get().logs.find(
          (l: WorkoutLog) => l.memberId === memberId && l.workoutDayId === dayId && l.date === today
        )
      },

      getStreakForMember: (memberId: string) => {
        const completedSessions = get()
          .logs
          .filter((l: WorkoutLog) => l.memberId === memberId && l.completedAt)
          .sort((a: WorkoutLog, b: WorkoutLog) =>
            new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
          )

        if (completedSessions.length === 0) return 0

        // Check if the most recent session is within 48 hours of now
        const now = new Date()
        const hoursSinceLastSession = (now.getTime() - new Date(completedSessions[0].completedAt!).getTime()) / (1000 * 60 * 60)
        if (hoursSinceLastSession > 48) return 0

        let streak = 1
        for (let i = 0; i < completedSessions.length - 1; i++) {
          const current = new Date(completedSessions[i].completedAt!)
          const previous = new Date(completedSessions[i + 1].completedAt!)
          const hoursDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60)

          if (hoursDiff <= 48) {
            streak++
          } else {
            break // gap too large, streak ends here
          }
        }
        return streak
      },

      // ── Mutations ──────────────────────────────────────────
      startLog: (memberId: string, planId: string, dayId: string) => {
        const today = new Date().toISOString().split('T')[0]
        const existing = get().logs.find((log: WorkoutLog) =>
          log.memberId === memberId &&
          log.workoutPlanId === planId &&
          log.workoutDayId === dayId &&
          log.date === today &&
          !log.completedAt
        )
        if (existing) return existing

        const newLog: WorkoutLog = {
          id: `log_${Date.now()}`,
          memberId,
          workoutPlanId: planId,
          workoutDayId: dayId,
          date: today,
          exercises: [],
        }
        set((s: WorkoutLogStore) => ({ logs: [...s.logs, newLog] }))
        return newLog
      },

      updateSetLog: (logId: string, exerciseId: string, setNumber: number, update: Partial<SetLog>) => {
        set((s: WorkoutLogStore) => ({
          logs: s.logs.map((log: WorkoutLog) => {
            if (log.id !== logId) return log
            return {
              ...log,
              exercises: log.exercises.map((ex: ExerciseLog) => {
                if (ex.exerciseId !== exerciseId) return ex
                return {
                  ...ex,
                  sets: ex.sets.map((st: SetLog) =>
                    st.setNumber === setNumber ? { ...st, ...update } : st
                  ),
                }
              }),
            }
          }),
        }))
      },

      addExerciseLog: (logId: string, exerciseLog: Omit<ExerciseLog, 'id'>) => {
        set((s: WorkoutLogStore) => ({
          logs: s.logs.map((log: WorkoutLog) => {
            if (log.id !== logId) return log

            const existingIndex = log.exercises.findIndex(
              (e: ExerciseLog) => e.exerciseId === exerciseLog.exerciseId
            )

            if (existingIndex !== -1) {
              const updatedExercises = [...log.exercises]
              updatedExercises[existingIndex] = {
                ...updatedExercises[existingIndex],
                sets: exerciseLog.sets,
              }
              return { ...log, exercises: updatedExercises }
            }

            const newExLog: ExerciseLog = { ...exerciseLog, id: `elog_${Date.now()}` }
            return { ...log, exercises: [...log.exercises, newExLog] }
          }),
        }))
      },

      finishLog: (logId: string) => {
        set((s: WorkoutLogStore) => ({
          logs: s.logs.map((log: WorkoutLog) =>
            log.id === logId
              ? { ...log, completedAt: new Date().toISOString() }
              : log
          ),
        }))
      },

      deleteLog: (logId: string) => {
        set((s: WorkoutLogStore) => ({ logs: s.logs.filter((l: WorkoutLog) => l.id !== logId) }))
      },

      // ── Progress Helpers ───────────────────────────────────
      getMaxWeightForExercise: (memberId: string, exerciseId: string) => {
        const logs = get().logs.filter((l: WorkoutLog) => l.memberId === memberId)
        let max = 0
        for (const log of logs) {
          const ex = log.exercises.find((e: ExerciseLog) => e.exerciseId === exerciseId)
          if (ex) {
            for (const set of ex.sets) {
              if (set.completed && set.weight > max) max = set.weight
            }
          }
        }
        return max
      },

      getWeightProgressForExercise: (memberId: string, exerciseId: string) => {
        const logs = get()
          .logs.filter((l: WorkoutLog) => l.memberId === memberId)
          .sort((a: WorkoutLog, b: WorkoutLog) => a.date.localeCompare(b.date))

        return logs
          .map((log: WorkoutLog) => {
            const ex = log.exercises.find((e: ExerciseLog) => e.exerciseId === exerciseId)
            if (!ex) return null
            const maxWeight = Math.max(...ex.sets.filter((s: SetLog) => s.completed).map((s: SetLog) => s.weight), 0)
            return { date: log.date, maxWeight }
          })
          .filter(Boolean) as { date: string; maxWeight: number }[]
      },
    }),
    {
      name: 'gymos-workout-logs',
      storage: createJSONStorage(() => localStorage),
    }
  )
) 