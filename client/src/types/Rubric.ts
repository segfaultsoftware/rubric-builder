import { type Weight } from './Weight'
import { type Profile } from './Profile'

export interface Rubric {
  id?: number | null
  name: string
  descriptor: string
  authorId?: number | null
  weights: Weight[]
  members: Profile[]
  pairings?: number[][]
}
