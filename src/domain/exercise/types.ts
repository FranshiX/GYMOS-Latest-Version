export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'ARMS'
  | 'LEGS'
  | 'CORE'

export interface Exercise {
  id: string
  name_ar: string
  name_en: string
  muscleGroup: MuscleGroup
  targetMuscles: string[]
  equipment: string
  videoUrl: string
  description_ar: string
  description_en: string
}