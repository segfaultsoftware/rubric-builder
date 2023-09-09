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
              profiles: []
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
      description: 'Interior Square Footage',
      profileWeights: []
    }

    weight2 = {
      id: 1948191,
      name: 'Lighting',
      description: 'Natural Light',
      profileWeights: []
    }

    rubric = {
      id: 1841,
      name: 'My Rubric',
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
        const { findByText, findAllByLabelText } = render()

        expect(await findByText('Edit a Rubric')).toBeInTheDocument()
        const nameInputs = await findAllByLabelText('Name')
        expect(nameInputs.length).toEqual(3) // rubric + weight x 2

        expect(nameInputs[0]).toHaveValue(rubric.name)
        expect(nameInputs[1]).toHaveValue(weight1.name)
        expect(nameInputs[2]).toHaveValue(weight2.name)
      })

      it('saves new weights to the backend', async () => {
        const { user, findByText, findAllByLabelText, findAllByRole } = render()

        const addButton = await findByText('Add')
        await user.click(addButton)

        let nameInputs = await findAllByLabelText('Name')
        expect(nameInputs.length).toEqual(4) // rubric + weight x 2 + new weight

        const newName = 'Newly Added Weight'
        const newDescription = 'Newly Added Description'
        await user.type(nameInputs[3], newName)

        nameInputs = await findAllByLabelText('Name')
        expect(nameInputs[3]).toHaveValue(newName)

        let descInputs = await findAllByLabelText('Description')
        expect(descInputs.length).toEqual(3) // weight x2 + new weight

        await user.type(descInputs[2], newDescription)

        descInputs = await findAllByLabelText('Description')
        expect(descInputs[2]).toHaveValue(newDescription)

        addStubToServer(server, {
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
                description: newDescription,
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
      })
    })
  })
})