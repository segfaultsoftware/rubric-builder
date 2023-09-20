import React from 'react'

import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { type Profile } from '../profile/profileSlice'
import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import RubricNew from './RubricNew'

describe('RubricNew', () => {
  const loggedInAs: Profile = { id: 123, displayName: 'Foo Bar' }
  let server: ReturnType<typeof setupServerWithStubs>
  let serverStubs: ServerStub[]

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
    const router = createMemoryRouter(routes, {
      initialEntries: ['/rubrics/new']
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
        const { user, findAllByRole, findByLabelText, findByText, findByPlaceholderText } = render()

        const nameInput = await findByLabelText('Name')
        await user.type(nameInput, 'My New Rubric')

        const weightNameInput = await findByPlaceholderText('Weight Name')
        await user.type(weightNameInput, 'My New Weight')

        const createRubricBodyPromise = addStubToServer(server, {
          method: 'post',
          url: '/api/v1/rubrics.json',
          json: {
            id: 123,
            name: 'My New Rubric',
            weights: [{
              id: 234,
              name: 'My New Weight',
              profileWeights: []
            }],
            members: [loggedInAs]
          }
        })

        const buttons = await findAllByRole('button')
        await user.click(buttons[1])

        expect(await findByText('Edit This')).toBeInTheDocument()

        const createRubricBody = await createRubricBodyPromise as any
        expect(createRubricBody.name).toEqual('My New Rubric')
        const weightAttributes = createRubricBody.weights_attributes as Array<Record<any, any>>
        expect(weightAttributes.length).toEqual(1)
        expect(weightAttributes[0].name).toEqual('My New Weight')
        expect(weightAttributes[0]).not.toHaveProperty('id')
        expect(weightAttributes[0]).not.toHaveProperty('_destroy')
      })
    })
  })
})
