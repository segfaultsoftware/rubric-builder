import { Factory } from 'fishery'

import { type Weight } from '../types/Weight'

export default Factory.define<Weight>(({ sequence }) => ({
  id: sequence,
  name: `Weight ${sequence}`,
  profileWeights: []
}))
