import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'

import { renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import ScoreAnalysis from './ScoreAnalysis'
import { type Rubric } from '../../types/Rubric'
import { type Weight } from '../../types/Weight'
import { type Profile } from '../../types/Profile'
import ProfileFactory from '../../factories/ProfileFactory'
import WeightFactory from '../../factories/WeightFactory'
import RubricFactory from '../../factories/RubricFactory'

describe('ScoreAnalysis', () => {
  let rubric: Rubric
  let weight1: Weight
  let weight2: Weight

  let user1: Profile
  let user2: Profile

  let scoreName1: string
  let scoreName2: string

  let scoresFromServer: Record<string, Record<number, Record<number, number>>>

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
    user1 = ProfileFactory.build({ displayName: 'Sam' })
    user2 = ProfileFactory.build({ displayName: 'Francis' })

    weight1 = WeightFactory.build({ name: 'ABC' })
    weight2 = WeightFactory.build({ name: 'XYZ' })

    rubric = RubricFactory.build({
      members: [user1, user2],
      weights: [weight1, weight2],
      authorId: user1.id
    })

    scoreName1 = '123 Mangrum'
    scoreName2 = '425 1st St Unit 1006'

    scoresFromServer = {
      [scoreName1]: {
        [user1.id]: {
          '-1': 6.8,
          [weight1.id!]: 2.3,
          [weight2.id!]: 4.5
        },
        [user2.id]: {
          '-1': 1.2,
          [weight1.id!]: 0.3,
          [weight2.id!]: 0.9
        }
      },
      [scoreName2]: {
        [user2.id]: {
          '-1': 2.5,
          [weight1.id!]: 1.8,
          [weight2.id!]: 0.7
        }
      }
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
        json: scoresFromServer
      })
    })

    it('displays a list of score names with high level stats', async () => {
      const { findByText } = render()

      const scoreName1Header = await findByText(`Scores for ${rubric.descriptor}: ${scoreName1}`)
      const scoreName1Section = scoreName1Header.parentElement!.parentElement!

      expect(await within(scoreName1Section).findByText(`Total for ${user1.displayName}: 6.8`)).toBeInTheDocument()
      expect(await within(scoreName1Section).findByText(`Total for ${user2.displayName}: 1.2`)).toBeInTheDocument()

      const scoreName2Header = await findByText(`Scores for ${rubric.descriptor}: ${scoreName2}`)
      const scoreName2Section = scoreName2Header.parentElement!.parentElement!

      expect(await within(scoreName2Section).findByText(`Total for ${user2.displayName}: 2.5`)).toBeInTheDocument()
      expect(within(scoreName2Section).queryByText(new RegExp(`Total for ${user1.displayName}`))).not.toBeInTheDocument()
    })
  })
})
