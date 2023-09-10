import React from 'react'

import { type Profile } from '../profile/profileSlice'
import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import RubricNew from './RubricNew'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

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
              profiles: []
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
      const { findByText, findAllByLabelText } = render()

      expect(await findByText('Create a Rubric')).toBeInTheDocument()
      const nameInputs = await findAllByLabelText('Name')
      expect(nameInputs.length).toEqual(2) // one for rubric, one for empty weight
    })

    describe('on submit', () => {
      it('redirects to the new edit page', async () => {
        const { user, findAllByRole, findAllByLabelText, findByText } = render()

        const nameInputs = await findAllByLabelText('Name')

        await user.type(nameInputs[0], 'My New Rubric')
        await user.type(nameInputs[1], 'My New Weight')

        const createRubricBodyPromise = addStubToServer(server, {
          method: 'post',
          url: '/api/v1/rubrics.json',
          json: {
            id: 123,
            name: 'My New Rubric',
            weights: [{
              id: 234,
              name: 'My New Weight',
              description: '',
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
        expect(weightAttributes[0].description).toEqual('')
        expect(weightAttributes[0]).not.toHaveProperty('id')
        expect(weightAttributes[0]).not.toHaveProperty('_destroy')
      })
    })
  })
})
