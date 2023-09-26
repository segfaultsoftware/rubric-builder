import {
  selectProfileWeightByWeightId,
  selectWeightByWeightId
} from './rubricSlice'
import { type Rubric } from '../../types/Rubric'
import { type Weight } from '../../types/Weight'
import { type ProfileWeight } from '../../types/ProfileWeight'
import { type Profile } from '../../types/Profile'
import ProfileFactory from '../../factories/ProfileFactory'
import ProfileWeightFactory from '../../factories/ProfileWeightFactory'
import WeightFactory from '../../factories/WeightFactory'
import RubricFactory from '../../factories/RubricFactory'

describe('rubricSlice', () => {
  let user1: Profile

  let profileWeightUser1Weight1: ProfileWeight
  let profileWeightUser1Weight2: ProfileWeight

  let weight1: Weight
  let weight2: Weight

  let rubric: Rubric

  beforeEach(() => {
    user1 = ProfileFactory.build()

    profileWeightUser1Weight1 = ProfileWeightFactory.build({
      weightId: 1,
      profileId: user1.id,
      value: 1
    })
    profileWeightUser1Weight2 = ProfileWeightFactory.build({
      weightId: 2,
      profileId: user1.id,
      value: 2
    })

    weight1 = WeightFactory.build({
      id: 1,
      profileWeights: [profileWeightUser1Weight1]
    })
    weight2 = WeightFactory.build({
      id: 2,
      profileWeights: [profileWeightUser1Weight2]
    })

    rubric = RubricFactory.build({
      weights: [weight1, weight2]
    })
  })

  describe('selectors', () => {
    describe('selectWeightByWeightId', () => {
      describe('with null rubric', () => {
        it('returns an empty map', () => {
          expect(selectWeightByWeightId.resultFunc(null)).toEqual(new Map())
        })
      })

      it('creates a lookup table by weight id', () => {
        const expected = new Map<number, Weight>()
        expected.set(weight1.id!, weight1)
        expected.set(weight2.id!, weight2)

        expect(selectWeightByWeightId.resultFunc(rubric)).toEqual(expected)
      })
    })

    describe('selectProfileWeightByWeightId', () => {
      describe('with null rubric', () => {
        it('returns an empty map', () => {
          expect(selectProfileWeightByWeightId.resultFunc(null)).toEqual(new Map())
        })
      })

      it('returns a lookup table by weight id', () => {
        const result = selectProfileWeightByWeightId.resultFunc(rubric)

        expect(result.size).toEqual(2)

        expect(result.get(weight1.id!)).toEqual(profileWeightUser1Weight1)
        expect(result.get(weight2.id!)).toEqual(profileWeightUser1Weight2)
      })
    })
  })
})
