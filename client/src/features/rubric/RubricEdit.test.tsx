import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import { type Profile } from '../profile/profileSlice'
import { type Rubric, type Weight } from './rubricSlice'
import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import RubricEdit from './RubricEdit'

describe('RubricEdit', () => {
  const loggedInAs: Profile = {
    id: 567,
    displayName: 'John Doe'
  }
  let rubric: Rubric
  let weight1: Weight
  let weight2: Weight
  let server: ReturnType<typeof setupServerWithStubs>
  let serverStubs: ServerStub[]

  const render = () => {
    server = setupServerWithStubs(serverStubs)
    server.listen()

    const routes = [
      {
        path: '/rubrics/:rubricId/edit',
        element: <RubricEdit />
      }
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/rubrics/${rubric.id}/edit`]
    })

    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RouterProvider router={router}/>,
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
    weight1 = {
      id: 915478,
      name: 'SQFT',
      profileWeights: []
    }

    weight2 = {
      id: 1948191,
      name: 'Lighting',
      profileWeights: []
    }

    rubric = {
      id: 1841,
      name: 'My Rubric',
      descriptor: 'Address',
      authorId: 567,
      weights: [weight1, weight2],
      members: [loggedInAs]
    }
  })

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  describe('before the rubric fetch completes', () => {
    it('renders loading', async () => {
      const { findByText } = render()

      const loading = await findByText(/Loading/)
      expect(loading).toBeInTheDocument()
    })

    describe('after the rubric fetches', () => {
      beforeEach(() => {
        serverStubs.push({
          method: 'get',
          url: `/api/v1/rubrics/${rubric.id}.json`,
          json: rubric
        })
      })

      it('renders the rubric', async () => {
        const { findByText, findByLabelText, findAllByPlaceholderText } = render()

        expect(await findByText('Edit a Rubric')).toBeInTheDocument()
        const nameInput = await findByLabelText('Name')
        expect(nameInput).toHaveValue(rubric.name)

        const descriptorInput = await findByLabelText('Descriptor')
        expect(descriptorInput).toHaveValue(rubric.descriptor)

        const weightNameInputs = await findAllByPlaceholderText('Weight Name')
        expect(weightNameInputs.length).toEqual(2)
        expect(weightNameInputs[0]).toHaveValue(weight1.name)
        expect(weightNameInputs[1]).toHaveValue(weight2.name)
      })

      it('saves new weights to the backend', async () => {
        const { user, findByText, findAllByRole, findAllByPlaceholderText } = render()

        const addButton = await findByText(/Add Weight/)
        await user.click(addButton)

        let nameInputs = await findAllByPlaceholderText('Weight Name')
        expect(nameInputs.length).toEqual(3) // weight x 2 + new weight

        const newName = 'Newly Added Weight'
        await user.type(nameInputs[2], newName)

        nameInputs = await findAllByPlaceholderText('Weight Name')
        expect(nameInputs[2]).toHaveValue(newName)

        const putRubricBodyPromise = addStubToServer(server, {
          method: 'put',
          url: `/api/v1/rubrics/${rubric.id}.json`,
          json: {
            ...rubric,
            weights: [
              weight1,
              weight2,
              {
                id: 9184819,
                name: newName,
                profileWeights: []
              }
            ]
          }
        })

        const buttons = await findAllByRole('button')
        expect(buttons.length).toEqual(3) // Add, Submit, Member

        const submitButton = buttons[1]
        await user.click(submitButton)

        expect(await findByText(/Saved at /)).toBeInTheDocument()

        const putRubricBody = await putRubricBodyPromise as any
        const weightAttributes = putRubricBody.weights_attributes as Array<Record<any, any>>
        expect(weightAttributes.length).toEqual(3)
        expect(weightAttributes[2].name).toEqual(newName)
        expect(weightAttributes[2]).not.toHaveProperty('id')
        expect(weightAttributes[2]).not.toHaveProperty('_destroy')
      })
    })
  })
})
