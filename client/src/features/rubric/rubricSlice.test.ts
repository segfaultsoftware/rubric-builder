import {
  type ProfileWeight,
  type Rubric,
  selectProfileWeightByWeightId,
  selectWeightByWeightId,
  type Weight
} from './rubricSlice'
import { type Profile } from '../profile/profileSlice'

describe('rubricSlice', () => {
  let user1: Profile

  let profileWeightUser1Weight1: ProfileWeight
  let profileWeightUser1Weight2: ProfileWeight

  let weight1: Weight
  let weight2: Weight

  let rubric: Rubric

  beforeEach(() => {
    user1 = { id: 1, displayName: 'Barbie' }

    profileWeightUser1Weight1 = {
      id: 1,
      weightId: 1,
      profileId: user1.id,
      value: 1
    }
    profileWeightUser1Weight2 = {
      id: 2,
      weightId: 2,
      profileId: user1.id,
      value: 2
    }

    weight1 = {
      id: 1,
      name: 'Weight 1',
      description: '',
      profileWeights: [profileWeightUser1Weight1]
    }
    weight2 = {
      id: 2,
      name: 'Weight 2',
      description: '',
      profileWeights: [profileWeightUser1Weight2]
    }

    rubric = {
      id: 1,
      name: 'Test Rubric',
      weights: [weight1, weight2],
      members: []
    }
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
