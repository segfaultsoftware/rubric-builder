import { type Score, selectScoreCalculationsMap } from './scoreSlice'
import { type Calibration, type Weight } from '../rubric/rubricSlice'
import { type Profile } from '../profile/profileSlice'

describe('scoreSlice', () => {
  describe('selectors', () => {
    describe('selectScoreCalculationsMap', () => {
      let user1: Profile
      let user2: Profile

      let calibrationUser1Weight1: Calibration
      let calibrationUser1Weight2: Calibration
      let calibrationUser2Weight1: Calibration
      let calibrationUser2Weight2: Calibration

      let weight1: Weight
      let weight2: Weight

      let calibrationsByUserAndWeight: Map<number, Map<number, Calibration>>

      const scoreName1 = '123 Place Ct'
      const scoreName2 = '999 Foobar Blvd'

      let scoreName1User1: Score
      let scoreName2User1: Score
      let scoreName2User2: Score

      beforeEach(() => {
        user1 = { id: 1, displayName: 'User One' }
        user2 = { id: 2, displayName: 'User Two' }

        calibrationUser1Weight1 = {
          id: 11,
          profileId: user1.id,
          weightId: 1,
          value: 3
        }
        calibrationUser1Weight2 = {
          id: 12,
          profileId: user1.id,
          weightId: 2,
          value: 5
        }
        calibrationUser2Weight1 = {
          id: 21,
          profileId: user2.id,
          weightId: 1,
          value: 7
        }
        calibrationUser2Weight2 = {
          id: 22,
          profileId: user2.id,
          weightId: 2,
          value: 11
        }

        weight1 = {
          id: 1,
          name: 'Weight 1',
          description: '',
          profileWeights: [
            calibrationUser1Weight1,
            calibrationUser2Weight1
          ]
        }

        weight2 = {
          id: 2,
          name: 'Weight 2',
          description: '',
          profileWeights: [
            calibrationUser1Weight2,
            calibrationUser2Weight2
          ]
        }

        calibrationsByUserAndWeight = new Map<number, Map<number, Calibration>>()
        const calibrationsByUser1AndWeight = new Map<number, Calibration>()
        calibrationsByUser1AndWeight.set(weight1.id!, calibrationUser1Weight1)
        calibrationsByUser1AndWeight.set(weight2.id!, calibrationUser1Weight2)
        const calibrationsByUser2AndWeight = new Map<number, Calibration>()
        calibrationsByUser2AndWeight.set(weight1.id!, calibrationUser2Weight1)
        calibrationsByUser2AndWeight.set(weight2.id!, calibrationUser2Weight2)

        calibrationsByUserAndWeight.set(user1.id, calibrationsByUser1AndWeight)
        calibrationsByUserAndWeight.set(user2.id, calibrationsByUser2AndWeight)

        scoreName1User1 = {
          id: 1,
          name: scoreName1,
          rubricId: 999,
          profileId: user1.id,
          scoreWeights: [{
            weightId: 1,
            value: 1
          }, {
            weightId: 2,
            value: 2
          }]
        }
        scoreName2User1 = {
          id: 2,
          name: scoreName2,
          rubricId: 999,
          profileId: user1.id,
          scoreWeights: [{
            weightId: 1,
            value: 3
          }, {
            weightId: 2,
            value: 4
          }]
        }
        scoreName2User2 = {
          id: 3,
          name: scoreName2,
          rubricId: 999,
          profileId: user2.id,
          scoreWeights: [{
            weightId: 1,
            value: 5
          }, {
            weightId: 2,
            value: 0
          }]
        }
      })

      describe('with no scores and no calibrations', () => {
        it('returns an empty map', () => {
          expect(selectScoreCalculationsMap.resultFunc([], new Map())).toEqual(new Map())
        })
      })

      describe('with no scores, but some calibrations', () => {
        it('returns an empty map', () => {
          expect(selectScoreCalculationsMap.resultFunc([], calibrationsByUserAndWeight)).toEqual(new Map())
        })
      })

      it('creates a nested map with calculations', () => {
        const result = selectScoreCalculationsMap.resultFunc(
          [scoreName1User1, scoreName2User1, scoreName2User2],
          calibrationsByUserAndWeight
        )

        expect(result.get(scoreName1)?.size).toEqual(1)
        expect(result.get(scoreName1)?.get(user1.id)?.size).toEqual(3)
        expect(result.get(scoreName1)?.get(user1.id)?.get(weight1.id!)).toEqual(
          scoreName1User1.scoreWeights[0].value * calibrationUser1Weight1.value
        )
        expect(result.get(scoreName1)?.get(user1.id)?.get(weight2.id!)).toEqual(
          scoreName1User1.scoreWeights[1].value * calibrationUser1Weight2.value
        )
        expect(result.get(scoreName1)?.get(user1.id)?.get(-1)).toEqual(
          scoreName1User1.scoreWeights[0].value * calibrationUser1Weight1.value +
          scoreName1User1.scoreWeights[1].value * calibrationUser1Weight2.value

        )

        expect(result.get(scoreName2)?.size).toEqual(2)
        expect(result.get(scoreName2)?.get(user1.id)?.size).toEqual(3)
        expect(result.get(scoreName2)?.get(user2.id)?.size).toEqual(3)
        expect(result.get(scoreName2)?.get(user1.id)?.get(weight1.id!)).toEqual(
          scoreName2User1.scoreWeights[0].value * calibrationUser1Weight1.value
        )
        expect(result.get(scoreName2)?.get(user1.id)?.get(weight2.id!)).toEqual(
          scoreName2User1.scoreWeights[1].value * calibrationUser1Weight2.value
        )
        expect(result.get(scoreName2)?.get(user1.id)?.get(-1)).toEqual(
          scoreName2User1.scoreWeights[0].value * calibrationUser1Weight1.value +
          scoreName2User1.scoreWeights[1].value * calibrationUser1Weight2.value
        )
        expect(result.get(scoreName2)?.get(user2.id)?.get(weight1.id!)).toEqual(
          scoreName2User2.scoreWeights[0].value * calibrationUser2Weight1.value
        )
        expect(result.get(scoreName2)?.get(user2.id)?.get(weight2.id!)).toEqual(
          scoreName2User2.scoreWeights[1].value * calibrationUser2Weight2.value
        )
        expect(result.get(scoreName2)?.get(user2.id)?.get(-1)).toEqual(
          scoreName2User2.scoreWeights[0].value * calibrationUser2Weight1.value +
          scoreName2User2.scoreWeights[1].value * calibrationUser2Weight2.value
        )
      })
    })
  })
})
