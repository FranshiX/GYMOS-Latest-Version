export interface BodyMeasurements {
  chest?: number
  waist?: number
  bodyFat?: number
  hips?: number
  arms?: number
  thighs?: number
}

export interface BodyMeasurement {
  id: string
  memberId: string
  date: string
  weight?: number
  measurements?: BodyMeasurements
}