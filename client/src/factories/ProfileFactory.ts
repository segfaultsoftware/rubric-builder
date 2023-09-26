import { Factory } from 'fishery'

import { type Profile } from '../types/Profile'

export default Factory.define<Profile>(({ sequence }) => ({
  id: sequence,
  displayName: `Profile ${sequence}`,
  isAdmin: false
}))
