import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'

import { type Calibration, type Rubric, type Weight } from '../rubric/rubricSlice'
import { type Profile } from '../profile/profileSlice'
import { renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import ScoreAnalysis from './ScoreAnalysis'
import { type Score } from './scoreSlice'

describe('ScoreAnalysis', () => {
  let rubric: Rubric
  let weight1: Weight
  let weight2: Weight

  let calibrationForUser1Weight1: Calibration
  let calibrationForUser1Weight2: Calibration
  let calibrationForUser2Weight1: Calibration
  let calibrationForUser2Weight2: Calibration

  let user1: Profile
  let user2: Profile

  let scoreName1: string
  let scoreName2: string

  let scoreName1User1: Score
  let scoreName2User1: Score
  let scoreName2User2: Score

  let scoreName1User1Total: number
  let scoreName2User1Total: number
  let scoreName2User2Total: number

  let serverStubs: ServerStub[]
  let server: ReturnType<typeof setupServerWithStubs>

  const render = () => {
    server = setupServerWithStubs(serverStubs)
    server.listen()

    const routes = [
      {
        path: 'rubrics/:rubricId/scores',
        element: <ScoreAnalysis />
      }
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/rubrics/${rubric.id}/scores`]
    })

    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RouterProvider router={router} />
      )
    }
  }

  beforeEach(() => {
    user1 = { id: 1, displayName: 'Sam' }
    user2 = { id: 2, displayName: 'Francis' }

    calibrationForUser1Weight1 = { id: 3, value: 4, weightId: 5, profileId: user1.id }
    calibrationForUser1Weight2 = { id: 4, value: 6, weightId: 7, profileId: user1.id }
    calibrationForUser2Weight1 = { id: 5, value: 8, weightId: 5, profileId: user2.id }
    calibrationForUser2Weight2 = { id: 6, value: 10, weightId: 7, profileId: user2.id }

    weight1 = {
      id: 5,
      name: 'ABC',
      description: '',
      profileWeights: [
        calibrationForUser1Weight1,
        calibrationForUser2Weight1
      ]
    }
    weight2 = {
      id: 7,
      name: 'XYZ',
      description: '',
      profileWeights: [
        calibrationForUser1Weight2,
        calibrationForUser2Weight2
      ]
    }

    rubric = {
      id: 23,
      name: 'Rubric',
      members: [user1, user2],
      weights: [weight1, weight2],
      authorId: user1.id
    }

    scoreName1 = '123 Mangrum'
    scoreName1User1 = {
      id: 9,
      name: scoreName1,
      profileId: user1.id,
      rubricId: rubric.id!,
      scoreWeights: [{
        id: 1,
        weightId: weight1.id!,
        value: 11
      }, {
        id: 2,
        weightId: weight2.id!,
        value: 12
      }]
    }

    scoreName2 = '425 1st St Unit 1006'
    scoreName2User1 = {
      id: 10,
      name: scoreName2,
      profileId: user1.id,
      rubricId: rubric.id!,
      scoreWeights: [{
        id: 3,
        weightId: weight1.id!,
        value: 13
      }, {
        id: 4,
        weightId: weight2.id!,
        value: 14
      }]
    }

    scoreName2User2 = {
      id: 11,
      name: scoreName2,
      profileId: user2.id,
      rubricId: rubric.id!,
      scoreWeights: [{
        id: 5,
        weightId: weight1.id!,
        value: 15
      }, {
        id: 6,
        weightId: weight2.id!,
        value: 16
      }]
    }

    scoreName1User1Total = calibrationForUser1Weight1.value * scoreName1User1.scoreWeights[0].value + calibrationForUser1Weight2.value * scoreName1User1.scoreWeights[1].value
    scoreName2User1Total = calibrationForUser1Weight1.value * scoreName2User1.scoreWeights[0].value + calibrationForUser1Weight2.value * scoreName2User1.scoreWeights[1].value
    scoreName2User2Total = calibrationForUser2Weight1.value * scoreName2User2.scoreWeights[0].value + calibrationForUser2Weight2.value * scoreName2User2.scoreWeights[1].value

    serverStubs = []
  })

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  it('displays loading text', async () => {
    const { findByText } = render()
    expect(await findByText('Loading...')).toBeInTheDocument()
  })

  describe('after the rubric comes back from the server', () => {
    beforeEach(() => {
      serverStubs.push({
        method: 'get',
        url: `/api/v1/rubrics/${rubric.id}.json`,
        json: rubric
      })
      serverStubs.push({
        method: 'get',
        url: `/api/v1/rubrics/${rubric.id}/scores.json`,
        json: [scoreName1User1, scoreName2User2, scoreName2User1]
      })
      serverStubs.push({
        method: 'get',
        url: '/api/v1/profiles.json',
        json: [user1, user2]
      })
    })

    it('displays a list of score names with high level stats', async () => {
      const { findByText } = render()

      const scoreName1Header = await findByText(`Scores for ${scoreName1}`)
      const scoreName1Section = scoreName1Header.parentElement!

      expect(await within(scoreName1Section).findByText(`Total for ${user1.displayName}: ${scoreName1User1Total}`)).toBeInTheDocument()
      expect(within(scoreName1Section).queryByText(`Total for ${user2.displayName}`)).not.toBeInTheDocument()

      const scoreName2Header = await findByText(`Scores for ${scoreName2}`)
      const scoreName2Section = scoreName2Header.parentElement!

      expect(await within(scoreName2Section).findByText(`Total for ${user1.displayName}: ${scoreName2User1Total}`)).toBeInTheDocument()
      expect(await within(scoreName2Section).findByText(`Total for ${user2.displayName}: ${scoreName2User2Total}`)).toBeInTheDocument()
    })
  })
})
