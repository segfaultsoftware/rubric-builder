import { Factory } from 'fishery'
import { type ProfileWeight } from '../types/ProfileWeight'

export default Factory.define<ProfileWeight>(({ sequence }) => ({
  id: sequence,
  profileId: sequence,
  weightId: sequence,
  value: Math.random()
}))
