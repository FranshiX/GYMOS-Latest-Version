export interface WorkoutExercise {
  id: string
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  notes?: string
}

export interface WorkoutDay {
  id: string
  dayNumber: number
  name_ar: string
  name_en: string
  exercises: WorkoutExercise[]
}

export interface WorkoutPlan {
  id: string
  name_ar: string
  name_en: string
  type: 'GENERAL' | 'CUSTOM'
  assignedMemberId?: string
  days: WorkoutDay[]
  createdAt?: string
  updatedAt?: string
}