import React from 'react'

import userEvent from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import RubricNew from './RubricNew'
import ProfileFactory from '../../factories/ProfileFactory'
import { type Rubric, RubricVisibility } from '../../types/Rubric'
import RubricFactory from '../../factories/RubricFactory'
import WeightFactory from '../../factories/WeightFactory'
import { type Weight } from '../../types/Weight'

describe('RubricNew', () => {
  const loggedInAs = ProfileFactory.build()
  let server: ReturnType<typeof setupServerWithStubs>
  let serverStubs: ServerStub[]
  let isCopyingFrom: number | null = null

  const render = () => {
    server = setupServerWithStubs(serverStubs || [])
    server.listen()

    const routes = [
      {
        path: '/rubrics/new',
        element: <RubricNew />
      },
      {
        path: '/rubrics/:rubricId/edit',
        element: <div>Edit This</div>
      }
    ]
    const query = isCopyingFrom ? `?copyFromId=${isCopyingFrom}` : ''
    const router = createMemoryRouter(routes, {
      initialEntries: [`/rubrics/new${query}`]
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
    serverStubs = []
  })

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  describe('on initial render', () => {
    it('comes with one empty weight', async () => {
      const { findByText, findByLabelText, findAllByPlaceholderText } = render()

      expect(await findByText('Create a Rubric')).toBeInTheDocument()
      const nameInput = await findByLabelText('Name')
      expect(nameInput).toBeInTheDocument()

      const weightNameInputs = await findAllByPlaceholderText('Weight Name')
      expect(weightNameInputs.length).toEqual(1)
    })

    describe('on submit', () => {
      it('redirects to the new edit page', async () => {
        const { user, findByLabelText, findByText, findByPlaceholderText } = render()

        const nameInput = await findByLabelText('Name')
        await user.type(nameInput, 'My New Rubric')

        const descriptorInput = await findByLabelText('Descriptor')
        await user.type(descriptorInput, 'Address')

        const weightNameInput = await findByPlaceholderText('Weight Name')
        await user.type(weightNameInput, 'My New Weight')

        const createRubricBodyPromise = addStubToServer(server, {
          method: 'post',
          url: '/api/v1/rubrics.json',
          json: {
            id: 123,
            name: 'My New Rubric',
            descriptor: 'Address',
            weights: [{
              id: 234,
              name: 'My New Weight',
              profileWeights: []
            }],
            members: [loggedInAs]
          }
        })

        const saveButton = await findByText(/Save Rubric/)
        await user.click(saveButton)

        expect(await findByText('Edit This')).toBeInTheDocument()

        const createRubricBody = await createRubricBodyPromise as any
        expect(createRubricBody.name).toEqual('My New Rubric')
        expect(createRubricBody.descriptor).toEqual('Address')

        const weightAttributes = createRubricBody.weights_attributes as Array<Record<any, any>>
        expect(weightAttributes.length).toEqual(1)
        expect(weightAttributes[0].name).toEqual('My New Weight')
        expect(weightAttributes[0]).not.toHaveProperty('id')
        expect(weightAttributes[0]).not.toHaveProperty('_destroy')
      })
    })

    describe('when copying', () => {
      let copyingFrom: Rubric
      let copyingFromWeight1: Weight
      let copyingFromWeight2: Weight

      beforeEach(() => {
        copyingFromWeight1 = WeightFactory.build()
        copyingFromWeight2 = WeightFactory.build()
        copyingFrom = RubricFactory.build({
          visibility: RubricVisibility.SystemTemplate,
          weights: [copyingFromWeight1, copyingFromWeight2],
          author: {
            displayName: 'Bob'
          },
          members: [ProfileFactory.build(), ProfileFactory.build()],
          pairings: [[1, 2], [3, 4]]
        })
        isCopyingFrom = copyingFrom.id!

        serverStubs.push({
          method: 'get',
          url: `/api/v1/rubrics/${copyingFrom.id}.json`,
          json: copyingFrom
        })
      })

      it('prefills all the fields with the copied rubric values', async () => {
        const { findByLabelText, findAllByPlaceholderText } = render()

        await waitFor(async () => {
          expect(await findByLabelText('Name')).toHaveValue(`Copy of ${copyingFrom.name}`)
        })
        expect(await findByLabelText('Descriptor')).toHaveValue(copyingFrom.descriptor)
        expect(await findByLabelText('Is Template?')).not.toBeChecked()

        const weights = await findAllByPlaceholderText('Weight Name')
        expect(weights.length).toEqual(2)
        expect(weights[0]).toHaveValue(copyingFromWeight1.name)
        expect(weights[1]).toHaveValue(copyingFromWeight2.name)
      })

      describe('on submit', () => {
        it('submits as if brand new', async () => {
          const { user, findByText, findByLabelText, findAllByPlaceholderText } = render()

          const nameInput = await findByLabelText('Name')
          await waitFor(async () => {
            expect(nameInput).toHaveValue(`Copy of ${copyingFrom.name}`)
          })

          const newName = 'My Copy of a Copy'
          await user.clear(nameInput)
          await user.type(nameInput, newName)

          const newWeight = 'Funness'
          const weights = await findAllByPlaceholderText('Weight Name')
          await user.clear(weights[0])
          await user.type(weights[0], newWeight)

          const newlyCreatedFromServer: Rubric = {
            id: 123,
            name: 'My New Rubric',
            descriptor: 'Address',
            visibility: RubricVisibility.MembersOnly,
            weights: [{
              id: 234,
              name: 'My New Weight',
              profileWeights: []
            }],
            members: [loggedInAs]
          }
          const createRubricBodyPromise = addStubToServer(server, {
            method: 'post',
            url: '/api/v1/rubrics.json',
            json: newlyCreatedFromServer
          })

          const saveButton = await findByText(/Save Rubric/)
          await user.click(saveButton)

          expect(await findByText('Edit This')).toBeInTheDocument()

          const createRubricBody = await createRubricBodyPromise as any
          expect(createRubricBody).not.toHaveProperty('id')
          expect(createRubricBody.name).toEqual(newName)
          expect(createRubricBody.descriptor).toEqual(copyingFrom.descriptor)
          expect(createRubricBody.visibility).toEqual(RubricVisibility.MembersOnly)

          const weightAttributes = createRubricBody.weights_attributes as Array<Record<any, any>>
          expect(weightAttributes.length).toEqual(2)
          expect(weightAttributes[0]).not.toHaveProperty('_destroy')
          expect(weightAttributes[0]).toHaveProperty('_new')
          expect(weightAttributes[0].name).toEqual(newWeight)
          expect(weightAttributes[1].name).toEqual(copyingFromWeight2.name)
          expect(weightAttributes[1]).not.toHaveProperty('_destroy')
          expect(weightAttributes[0]).toHaveProperty('_new')
        })
      })
    })
  })
})
