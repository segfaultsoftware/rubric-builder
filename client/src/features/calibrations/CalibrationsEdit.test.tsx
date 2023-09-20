import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import { type ProfileWeight, type Rubric, type Weight } from '../rubric/rubricSlice'
import { type Profile } from '../profile/profileSlice'
import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import CalibrationsEdit from './CalibrationsEdit'
import { fireEvent } from '@testing-library/react'

describe('CalibrationsEdit', () => {
  let rubric: Rubric
  let weight1: Weight
  let weight2: Weight
  let weight3: Weight

  let profileWeightForLoggedInAsWeight1: ProfileWeight
  let profileWeightForLoggedInAsWeight2: ProfileWeight
  let profileWeightForLoggedInAsWeight3: ProfileWeight

  let loggedInAs: Profile
  let otherMember: Profile

  let serverStubs: ServerStub[]
  let server: ReturnType<typeof setupServerWithStubs>

  const render = () => {
    server = setupServerWithStubs(serverStubs)
    server.listen()

    const routes = [
      {
        path: 'calibrations/:rubricId/edit',
        element: <CalibrationsEdit useRandom={false} />
      }
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/calibrations/${rubric.id}/edit`]
    })

    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RouterProvider router={router} />,
        {
          preloadedState: {
            profile: {
              loggedInAs,
              loginError: undefined,
              registerErrors: []
            }
          }
        }
      )
    }
  }

  beforeEach(() => {
    loggedInAs = { id: 2, displayName: 'Almost Root' }
    otherMember = { id: 5, displayName: 'Other User' }

    profileWeightForLoggedInAsWeight1 = { id: 555, value: 0.33, weightId: 8, profileId: 2 }
    profileWeightForLoggedInAsWeight2 = { id: 666, value: 0.47, weightId: 9, profileId: 2 }
    profileWeightForLoggedInAsWeight3 = { id: 777, value: 0.2, weightId: 10, profileId: 2 }

    weight1 = {
      id: 8,
      name: 'Weight 1',
      description: 'Description 1',
      profileWeights: [profileWeightForLoggedInAsWeight1]
    }
    weight2 = {
      id: 9,
      name: 'Weight 2',
      description: 'Description 2',
      profileWeights: [profileWeightForLoggedInAsWeight2]
    }
    weight3 = {
      id: 10,
      name: 'Weight 3',
      description: 'Description 3',
      profileWeights: [profileWeightForLoggedInAsWeight3]
    }

    rubric = {
      id: 11,
      name: 'Calibrated Rubric',
      members: [loggedInAs, otherMember],
      weights: [weight1, weight2, weight3],
      authorId: loggedInAs.id,
      pairings: [
        [weight1.id!, weight3.id!],
        [weight2.id!, weight3.id!]
      ]
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
    })

    it('renders the first test logged in user', async () => {
      const { findByText, findByLabelText, findByRole, queryByText } = render()

      expect(await findByText(`Calibrate ${rubric.name}`)).toBeInTheDocument()

      expect(await findByText(weight1.name)).toBeInTheDocument()
      expect(await findByText(weight3.name)).toBeInTheDocument()
      expect(queryByText(weight2.name)).not.toBeInTheDocument()

      expect(await findByLabelText('I favor')).toBeInTheDocument()
      expect(await findByRole('button')).toBeInTheDocument()
    })

    describe('after updating values', () => {
      it('notifies of the save and advances to the next test', async () => {
        const { user, findByLabelText, findByRole, findByText, queryByText } = render()

        const putCalibrationsPromise = addStubToServer(server, {
          method: 'put',
          url: `/api/v1/rubrics/${rubric.id}/calibrations.json`,
          json: {}
        })

        const slider = await findByLabelText('I favor')
        fireEvent.change(slider, { target: { value: 4 } }) // slider goes -8 to 8 and react converts it

        const button = await findByRole('button')
        await user.click(button)

        expect(await findByText(weight2.name)).toBeInTheDocument()
        expect(await findByText(weight3.name)).toBeInTheDocument()
        expect(queryByText(weight1.name)).not.toBeInTheDocument()

        const putCalibration = await putCalibrationsPromise as any
        expect(putCalibration.from_weight_id).toEqual(weight1.id)
        expect(putCalibration.to_weight_id).toEqual(weight3.id)
        expect(putCalibration.rating).toEqual(1 / 5.0)
      })

      describe('after exhausting all combinations', () => {
        it('shows a restart prompt', async () => {
          const { user, findByRole, findByText, queryByText, queryByLabelText } = render()
          const buttonFn = async () => findByRole('button')

          expect(queryByText(/Restart/)).not.toBeInTheDocument()
          await user.click(await buttonFn())
          await user.click(await buttonFn())

          expect(await findByText(/Restart/)).toBeInTheDocument()
          expect(queryByLabelText('I favor')).not.toBeInTheDocument()
          expect(queryByText(weight1.name)).not.toBeInTheDocument()
          expect(queryByText(weight2.name)).not.toBeInTheDocument()
          expect(queryByText(weight3.name)).not.toBeInTheDocument()
        })

        describe('after clicking the restart prompt', () => {
          it('starts over', async () => {
            const { user, findByText, queryByText } = render()
            const buttonFn = async () => findByText('Save')

            addStubToServer(server, {
              method: 'put',
              url: `/api/v1/rubrics/${rubric.id}/calibrations.json`,
              json: {}
            })

            expect(queryByText(/Restart/)).not.toBeInTheDocument()
            await user.click(await buttonFn())
            await user.click(await buttonFn())

            const restartButton = await findByText(/Restart/)
            await user.click(restartButton)

            expect(await findByText('I favor')).toBeInTheDocument()
            expect(await findByText(weight1.name)).toBeInTheDocument()
            expect(queryByText(weight2.name)).not.toBeInTheDocument()
            expect(await findByText(weight3.name)).toBeInTheDocument()
            expect(queryByText(/Restart/)).not.toBeInTheDocument()
          })
        })
      })
    })
  })
})
