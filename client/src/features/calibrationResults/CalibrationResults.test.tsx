import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import { renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import CalibrationResults from './CalibrationResults'
import { type Rubric } from '../../types/Rubric'
import { type Profile } from '../../types/Profile'
import ProfileFactory from '../../factories/ProfileFactory'
import WeightFactory from '../../factories/WeightFactory'
import RubricFactory from '../../factories/RubricFactory'

describe('CalibrationResults', () => {
  let rubric: Rubric
  let user1: Profile
  let user2: Profile

  let serverStubs: ServerStub[]
  let server: ReturnType<typeof setupServerWithStubs>

  const render = () => {
    server = setupServerWithStubs(serverStubs)
    server.listen()

    const routes = [
      {
        path: 'rubrics/:rubricId/calibration-results',
        element: <CalibrationResults />
      }
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/rubrics/${rubric.id}/calibration-results`]
    })

    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RouterProvider router={router} />,
        {
          preloadedState: {
            profile: {
              loggedInAs: user1,
              loginError: undefined,
              registerErrors: []
            }
          }
        }
      )
    }
  }

  beforeEach(() => {
    user1 = ProfileFactory.build({ displayName: 'Sam' })
    user2 = ProfileFactory.build({ displayName: 'Francis' })

    const weight1 = WeightFactory.build({ name: 'Location' })
    const weight2 = WeightFactory.build({ name: 'Price' })

    rubric = RubricFactory.build({
      name: 'House Buying',
      members: [user1, user2],
      weights: [weight1, weight2],
      authorId: user1.id
    })

    serverStubs = []
  })

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  it('displays loading text initially', async () => {
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
    })

    describe('after calibration results come back from the server', () => {
      beforeEach(() => {
        serverStubs.push({
          method: 'get',
          url: `/api/v1/rubrics/${rubric.id}/calibration_results.json`,
          json: {
            profile: {
              id: user1.id,
              display_name: user1.displayName,
              is_admin: false
            },
            calibration_progress: {
              total: 1,
              completed: 0,
              remaining: 1
            },
            profile_weights: [
              {
                id: 1,
                value: 0.6,
                profile_id: user1.id,
                weight_id: 1,
                weight: { id: 1, name: 'Location', image_url: null }
              },
              {
                id: 2,
                value: 0.4,
                profile_id: user1.id,
                weight_id: 2,
                weight: { id: 2, name: 'Price', image_url: null }
              }
            ]
          }
        })
      })

      it('displays the rubric name in the header', async () => {
        const { findByText } = render()
        expect(await findByText('Calibration Results for House Buying')).toBeInTheDocument()
      })

      it('displays the member selector with all members', async () => {
        const { findByRole } = render()
        const select = await findByRole('combobox')
        expect(select).toBeInTheDocument()
      })

      it('displays calibration progress', async () => {
        const { findByText } = render()
        expect(await findByText(/Calibration Progress for Sam/)).toBeInTheDocument()
        expect(await findByText('0 / 1')).toBeInTheDocument()
        expect(await findByText('1 comparisons remaining')).toBeInTheDocument()
      })

      it('displays weight importance table', async () => {
        const { findByText } = render()
        expect(await findByText('Weight Importance (sorted by value)')).toBeInTheDocument()
        expect(await findByText('Location')).toBeInTheDocument()
        expect(await findByText('Price')).toBeInTheDocument()
        expect(await findByText('0.6')).toBeInTheDocument()
        expect(await findByText('0.4')).toBeInTheDocument()
      })

      it('displays navigation links but not a link to itself', async () => {
        const { findByText, queryByText } = render()
        expect(await findByText('Score')).toBeInTheDocument()
        expect(await findByText('Analyze')).toBeInTheDocument()
        expect(await findByText('Calibrate')).toBeInTheDocument()
        expect(queryByText('Calibration Results')).not.toBeInTheDocument()
        expect(await findByText('Edit')).toBeInTheDocument()
      })
    })
  })
})
