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

  let scoreName1User1: Score
  let scoreName2User1: Score
  let scoreName2User2: Score

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

    scoreName1User1 = {
      id: 9,
      name: '123 Mangrum',
      profileId: user1.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rubricId: rubric.id!,
      scoreWeights: [{
        id: 1,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weightId: weight1.id!,
        value: 11
      }, {
        id: 2,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weightId: weight2.id!,
        value: 12
      }]
    }

    scoreName2User1 = {
      id: 10,
      name: '425 1st St Unit 1006',
      profileId: user1.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rubricId: rubric.id!,
      scoreWeights: [{
        id: 3,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weightId: weight1.id!,
        value: 13
      }, {
        id: 4,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weightId: weight2.id!,
        value: 14
      }]
    }

    scoreName2User2 = {
      id: 11,
      name: scoreName2User1.name,
      profileId: user2.id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rubricId: rubric.id!,
      scoreWeights: [{
        id: 5,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weightId: weight1.id!,
        value: 15
      }, {
        id: 6,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weightId: weight2.id!,
        value: 16
      }]
    }

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

    it('renders the calculated scores per score name and user', async () => {
      const { findByText } = render()

      const name1User1Section = await findByText(`${scoreName1User1.name} by ${user1.displayName}`)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const name1User1Table = name1User1Section.parentElement!
      const name1User1Weight1Score = calibrationForUser1Weight1.value * scoreName1User1.scoreWeights[0].value
      const name1User1Weight2Score = calibrationForUser1Weight2.value * scoreName1User1.scoreWeights[1].value
      const name1User1TotalScore = name1User1Weight1Score + name1User1Weight2Score

      expect(await findByText(name1User1Weight1Score)).toBeInTheDocument()
      expect(await within(name1User1Table).findByText(name1User1Weight1Score)).toBeInTheDocument()
      expect(await within(name1User1Table).findByText(name1User1Weight2Score)).toBeInTheDocument()
      expect(await within(name1User1Table).findByText(name1User1TotalScore)).toBeInTheDocument()
    })
  })
})
