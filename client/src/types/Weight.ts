import { type ProfileWeight } from './ProfileWeight'

export interface Weight {
  id?: number
  name: string
  imageUrl?: string
  profileWeights: ProfileWeight[]
  _destroy?: boolean
  _new?: boolean
}
