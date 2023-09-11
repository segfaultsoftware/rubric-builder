import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import { type Calibration, type Rubric, type Weight } from '../rubric/rubricSlice'
import { type Profile } from '../profile/profileSlice'
import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import CalibrationsEdit from './CalibrationsEdit'

describe('CalibrationsEdit', () => {
  let rubric: Rubric
  let weight1: Weight
  let weight2: Weight

  let calibrationForLoggedInAsWeight1: Calibration
  let calibrationForLoggedInAsWeight2: Calibration
  let calibrationForOtherMemberWeight1: Calibration
  let calibrationForOtherMemberWeight2: Calibration

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
        element: <CalibrationsEdit />
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
              profiles: [loggedInAs, otherMember]
            }
          }
        }
      )
    }
  }

  beforeEach(() => {
    loggedInAs = { id: 2, displayName: 'Almost Root' }
    otherMember = { id: 5, displayName: 'Other User' }

    calibrationForLoggedInAsWeight1 = { id: 555, value: 1.23, weightId: 8, profileId: 2 }
    calibrationForLoggedInAsWeight2 = { id: 666, value: 5.67, weightId: 9, profileId: 2 }
    calibrationForOtherMemberWeight1 = { id: 777, value: 1, weightId: 8, profileId: 5 }
    calibrationForOtherMemberWeight2 = { id: 888, value: 98.0, weightId: 9, profileId: 5 }

    weight1 = {
      id: 8,
      name: 'Weight 1',
      description: 'Description 1',
      profileWeights: [
        calibrationForLoggedInAsWeight1, calibrationForOtherMemberWeight1
      ]
    }
    weight2 = {
      id: 9,
      name: 'Weight 2',
      description: 'Description 2',
      profileWeights: [
        calibrationForLoggedInAsWeight2, calibrationForOtherMemberWeight2
      ]
    }

    rubric = {
      id: 11,
      name: 'Calibrated Rubric',
      members: [loggedInAs, otherMember],
      weights: [weight1, weight2],
      authorId: loggedInAs.id
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

    it('renders the calibrations for the logged in user', async () => {
      const { findByText, findByLabelText } = render()

      expect(await findByText(`Calibrate ${rubric.name}`)).toBeInTheDocument()

      const weight1Input = await findByLabelText(new RegExp(weight1.name))
      expect(weight1Input).toHaveValue(calibrationForLoggedInAsWeight1.value.toString())

      const weight2Input = await findByLabelText(new RegExp(weight2.name))
      expect(weight2Input).toHaveValue(calibrationForLoggedInAsWeight2.value.toString())
    })

    describe('validations', () => {
      it('validates a calibration value is a number', async () => {
        const { user, findByLabelText, findByText, findByRole } = render()

        expect(await findByRole('button')).not.toBeDisabled()

        const input = await findByLabelText(new RegExp(weight1.name))
        await user.clear(input)
        await user.type(input, 'foobar')

        expect(await findByText('Must be a number')).toBeInTheDocument()
        expect(await findByRole('button')).toBeDisabled()
      })

      it('validates a calibration value is present', async () => {
        const { user, findByLabelText, findByText, findByRole } = render()

        expect(await findByRole('button')).not.toBeDisabled()

        const input = await findByLabelText(new RegExp(weight1.name))
        await user.clear(input)

        expect(await findByText('Must have a value')).toBeInTheDocument()
        expect(await findByRole('button')).toBeDisabled()
      })

      it('validates a calibration value is positive', async () => {
        const { user, findByLabelText, findByText, findByRole } = render()

        expect(await findByRole('button')).not.toBeDisabled()

        const input = await findByLabelText(new RegExp(weight1.name))
        await user.clear(input)
        await user.type(input, '-1')

        expect(await findByText('Must be >= 0')).toBeInTheDocument()
        expect(await findByRole('button')).toBeDisabled()
      })
    })

    describe('after updating values', () => {
      it('notifies of the save', async () => {
        const { user, findByLabelText, findByRole, findByText } = render()

        const weight1Input = await findByLabelText(new RegExp(weight1.name))
        await user.clear(weight1Input)
        await user.type(weight1Input, '23.456')

        const putCalibrationsPromise = addStubToServer(server, {
          method: 'put',
          url: `/api/v1/rubrics/${rubric.id}/calibrations.json`,
          json: {}
        })

        const saveButton = await findByRole('button')
        await user.click(saveButton)

        expect(await findByText(/Saved at /)).toBeInTheDocument()

        const putCalibrations = await putCalibrationsPromise as any
        expect(putCalibrations.calibrations?.length).toEqual(1)
        expect(putCalibrations.calibrations[0].profile_id).toEqual(loggedInAs.id)
        expect(putCalibrations.calibrations[0].weight_id).toEqual(weight1.id)
        expect(putCalibrations.calibrations[0].value).toEqual('23.456')
      })
    })
  })
})
