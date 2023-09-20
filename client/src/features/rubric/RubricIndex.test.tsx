import React from 'react'

import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { type Rubric } from './rubricSlice'
import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import { type Profile } from '../profile/profileSlice'
import RubricIndex from './RubricIndex'

describe('RubricIndex', () => {
  const loggedInAs: Profile | null = null
  const rubric1: Rubric = {
    id: 9,
    name: 'Rubric 1',
    descriptor: 'Address',
    members: [],
    weights: []
  }
  const rubric2: Rubric = {
    id: 111,
    name: 'Rubric 2',
    descriptor: 'Address',
    members: [],
    weights: []
  }
  let router: ReturnType<typeof createMemoryRouter>
  let server: ReturnType<typeof setupServerWithStubs>
  const stubs: ServerStub[] = [
    {
      method: 'get',
      url: '/api/v1/rubrics.json',
      json: [rubric1, rubric2]
    }
  ]

  const render = () => {
    server = setupServerWithStubs(stubs)
    server.listen()

    return renderWithProviders(
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

  beforeEach(() => {
    const routes = [
      {
        path: '/rubrics',
        element: <RubricIndex />
      }
    ]

    router = createMemoryRouter(routes, {
      initialEntries: ['/rubrics']
    })
  })

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  describe('initial rendering', () => {
    it('displays all the rubrics from the backend', async () => {
      const { findByText } = render()

      expect(await findByText('Rubric 1')).not.toBeEmptyDOMElement()
      expect(await findByText('Rubric 2')).not.toBeEmptyDOMElement()
    })

    describe('deleting a Rubric', () => {
      it('rerenders the page with the fresh data from the server', async () => {
        const { findByText, queryByText, findAllByTitle } = render()

        const deleteButtons = await findAllByTitle('Delete')
        expect(deleteButtons.length).toEqual(2)

        addStubToServer(server, { method: 'delete', url: `/api/v1/rubrics/${rubric2.id}.json`, json: {} })
        addStubToServer(server, { method: 'get', url: '/api/v1/rubrics.json', json: [rubric1] })

        fireEvent.click(deleteButtons[1])

        await waitForElementToBeRemoved(() => queryByText('Rubric 2'))
        expect(await findByText('Rubric 1')).not.toBeEmptyDOMElement()
      })
    })
  })
})
