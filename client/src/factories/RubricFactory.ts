import { Factory } from 'fishery'

import { type Rubric, RubricVisibility } from '../types/Rubric'
import ProfileFactory from './ProfileFactory'

export default Factory.define<Rubric>(({ sequence }) => ({
  id: sequence,
  name: `Rubric ${sequence}`,
  descriptor: 'Address',
  visibility: RubricVisibility.MembersOnly,
  authorId: ProfileFactory.build().id,
  weights: [],
  members: [],
  pairings: []
}))
