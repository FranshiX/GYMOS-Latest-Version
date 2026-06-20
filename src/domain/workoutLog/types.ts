export interface SetLog {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

export interface ExerciseLog {
  id: string
  exerciseId: string
  sets: SetLog[]
}

export interface WorkoutLog {
  id: string
  memberId: string
  workoutPlanId: string
  workoutDayId: string
  date: string
  exercises: ExerciseLog[]
}