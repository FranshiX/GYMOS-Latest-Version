import { create } from 'zustand'
import { Exercise, MuscleGroup } from '../domain/exercise/types'
import exercisesData from '../data/exercises.json'

export interface ExerciseStore {
  exercises: Exercise[]
  addExercise: (exercise: Omit<Exercise, 'id'>) => void
  updateExercise: (id: string, updates: Partial<Exercise>) => void
  deleteExercise: (id: string) => void
  getById: (id: string) => Exercise | undefined
  getByMuscleGroup: (group: MuscleGroup) => Exercise[]
}

export const useExerciseStore = create<ExerciseStore>((set: any, get: any) => ({
  exercises: exercisesData as Exercise[],

  addExercise: (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: `ex_${Date.now()}`,
    }
    set((s: ExerciseStore) => ({ exercises: [...s.exercises, newExercise] }))
  },

  updateExercise: (id: string, updates: Partial<Exercise>) => {
    set((s: ExerciseStore) => ({
      exercises: s.exercises.map((e: Exercise) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  },

  deleteExercise: (id: string) => {
    set((s: ExerciseStore) => ({ exercises: s.exercises.filter((e: Exercise) => e.id !== id) }))
  },

  getById: (id: string) => get().exercises.find((e: Exercise) => e.id === id),

  getByMuscleGroup: (group: MuscleGroup) => get().exercises.filter((e: Exercise) => e.muscleGroup === group),
}))