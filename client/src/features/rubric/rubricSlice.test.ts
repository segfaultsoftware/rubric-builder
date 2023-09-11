import { type Calibration, type Rubric, selectCalibrationsByUserAndWeight, selectWeightByWeightId, type Weight } from './rubricSlice'
import { type Profile } from '../profile/profileSlice'

describe('rubricSlice', () => {
  let user1: Profile
  let user2: Profile

  let calibrationUser1Weight1: Calibration
  let calibrationUser1Weight2: Calibration
  let calibrationUser2Weight1: Calibration
  let calibrationUser2Weight2: Calibration

  let weight1: Weight
  let weight2: Weight

  let rubric: Rubric

  beforeEach(() => {
    user1 = { id: 1, displayName: 'Barbie' }
    user2 = { id: 2, displayName: 'Ken' }

    calibrationUser1Weight1 = {
      id: 1,
      weightId: 1,
      profileId: user1.id,
      value: 1
    }
    calibrationUser1Weight2 = {
      id: 2,
      weightId: 2,
      profileId: user1.id,
      value: 2
    }
    calibrationUser2Weight1 = {
      id: 3,
      weightId: 1,
      profileId: user2.id,
      value: 3
    }
    calibrationUser2Weight2 = {
      id: 4,
      weightId: 2,
      profileId: user2.id,
      value: 4
    }

    weight1 = {
      id: 1,
      name: 'Weight 1',
      description: '',
      profileWeights: [calibrationUser1Weight1, calibrationUser2Weight1]
    }
    weight2 = {
      id: 2,
      name: 'Weight 2',
      description: '',
      profileWeights: [calibrationUser1Weight2, calibrationUser2Weight2]
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

    describe('selectCalibrationsByUserAndWeight', () => {
      describe('with null rubric', () => {
        it('returns an empty map', () => {
          expect(selectCalibrationsByUserAndWeight.resultFunc(null)).toEqual(new Map())
        })
      })

      it('returns a nested map from user to weight to calibration', () => {
        const result = selectCalibrationsByUserAndWeight.resultFunc(rubric)

        expect(result.get(user1.id)?.size).toEqual(2)
        expect(result.get(user2.id)?.size).toEqual(2)

        expect(result.get(user1.id)?.get(weight1.id!)).toEqual(calibrationUser1Weight1)
        expect(result.get(user1.id)?.get(weight2.id!)).toEqual(calibrationUser1Weight2)
        expect(result.get(user2.id)?.get(weight1.id!)).toEqual(calibrationUser2Weight1)
        expect(result.get(user2.id)?.get(weight2.id!)).toEqual(calibrationUser2Weight2)
      })
    })
  })
})
