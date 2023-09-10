import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import ScoreNew from './ScoreNew'
import { type Rubric } from '../rubric/rubricSlice'

describe('ScoreNew', () => {
  let rubric: Rubric
  let router: ReturnType<typeof createMemoryRouter>
  let server: ReturnType<typeof setupServerWithStubs>
  let stubs: ServerStub[]

  const render = () => {
    server = setupServerWithStubs(stubs)
    server.listen()
    return {
      user: userEvent.setup(),
      ...renderWithProviders(
    <RouterProvider router={router}/>,
    {
      preloadedState: {
        profile: {
          loggedInAs: {
            id: 123,
            displayName: 'The Author'
          },
          profiles: []
        }
      }
    }
      )
    }
  }

  beforeEach(() => {
    rubric = {
      id: 7,
      name: 'Test Rubric',
      members: [],
      weights: [{
        id: 1,
        name: 'Weight 1',
        description: 'Weight 1 Description',
        profileWeights: []
      }, {
        id: 7,
        name: 'Weight 2',
        description: 'Some other thing',
        profileWeights: []
      }]
    }
    const routes = [
      {
        path: '/rubrics/:rubricId/scores/new',
        element: <ScoreNew />
      },
      {
        path: '/rubrics/:rubricId/scores',
        element: <div>Neat</div>
      }
    ]
    router = createMemoryRouter(routes, {
      initialEntries: [`/rubrics/${rubric.id}/scores/new`]
    })
    stubs = []
  })

  const getRubricStub = (): ServerStub => {
    return {
      method: 'get',
      url: `/api/v1/rubrics/${rubric.id}.json`,
      json: rubric
    }
  }

  const postScoreStub = (): ServerStub => {
    return {
      method: 'post',
      url: `/api/v1/rubrics/${rubric.id}/scores.json`,
      json: {}
    }
  }

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  describe('initial render', () => {
    it('displays Loading', () => {
      render()
      expect(screen.getByText(/Loading/)).toBeInTheDocument()
    })

    describe('after the GET rubric resolves', () => {
      beforeEach(() => {
        stubs.push(getRubricStub())
      })

      it('renders the page', async () => {
        const { findByText } = render()
        expect(await findByText('Score Test Rubric')).not.toBeEmptyDOMElement()
        expect(await findByText(/Weight 1/)).not.toBeEmptyDOMElement()
        expect(await findByText(/Weight 2/)).not.toBeEmptyDOMElement()
      })

      describe('adjusting a score and submitting', () => {
        it('redirects', async () => {
          const { user, findByLabelText, findByText, queryByText } = render()

          const postBodyPromise = addStubToServer(server, postScoreStub())

          const scoreNameInput = await findByLabelText('Name for this Scoring')
          await user.type(scoreNameInput, '123 Main St')

          const slider = await findByLabelText(/Weight 1/)
          fireEvent.change(slider, { target: { value: 5 } })

          const button = await findByText('Save')
          fireEvent.click(button)

          await waitForElementToBeRemoved(() => queryByText('Save'))

          expect(router.state.location.pathname).toEqual(`/rubrics/${rubric.id}/scores`)

          const postBody = await postBodyPromise as any
          expect(postBody.name).toEqual('123 Main St')
          expect(postBody.profile_id).toEqual(123)
          expect(postBody.rubric_id).toEqual(rubric.id)

          const scoreWeights = postBody.score_weights_attributes
          expect(scoreWeights.length).toEqual(2)
          expect(scoreWeights[0].weight_id).toEqual(rubric.weights[0].id)
          expect(scoreWeights[0].value).toEqual(5)
          expect(scoreWeights[1].weight_id).toEqual(rubric.weights[1].id)
          expect(scoreWeights[1].value).toEqual(1)
        })
      })
    })
  })
})
