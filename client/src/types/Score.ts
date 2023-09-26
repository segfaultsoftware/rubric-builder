import { type ScoreWeight } from './ScoreWeight'

export interface Score {
  id?: number
  name: string
  profileId: number
  rubricId: number
  scoreWeights: ScoreWeight[]
}
