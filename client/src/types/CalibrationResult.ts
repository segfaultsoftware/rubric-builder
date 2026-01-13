import { type Profile } from './Profile'

export interface CalibrationProgress {
  total: number
  completed: number
  remaining: number
}

export interface CalibrationResultWeight {
  id: number
  name: string
  imageUrl?: string
}

export interface CalibrationResultProfileWeight {
  id: number
  value: number
  profileId: number
  weightId: number
  weight: CalibrationResultWeight
}

export interface CalibrationResultsResponse {
  profile: Profile
  calibrationProgress: CalibrationProgress
  profileWeights: CalibrationResultProfileWeight[]
}
