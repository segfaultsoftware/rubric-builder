import React from 'react'

import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { addStubToServer, renderWithProviders, type ServerStub, setupServerWithStubs } from '../../utils/test-utils'
import ScoreNew from './ScoreNew'

import { type Rubric } from '../../types/Rubric'

describe('ScoreNew', () => {
  let rubric: Rubric
  const scoreName1 = 'Score Name 1'
  const scoreName2 = 'Score Name 2'
  let scores: Record<string, Record<number, Record<number, number>>>
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
          loginError: undefined,
          registerErrors: []
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
      descriptor: 'Address',
      members: [],
      weights: [{
        id: 1,
        name: 'Weight 1',
        profileWeights: []
      }, {
        id: 7,
        name: 'Weight 2',
        profileWeights: []
      }]
    }

    scores = {
      [scoreName1]: {
        123: {
          '-1': 1.0,
          1: 0.5,
          7: 0.5
        }
      },
      [scoreName2]: {
        123: {
          '-1': 1.0,
          1: 0.5,
          7: 0.5
        }
      }
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

  const getScoresStub = (): ServerStub => {
    return {
      method: 'get',
      url: `/api/v1/rubrics/${rubric.id}/scores.json`,
      json: scores
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
    it('displays Loading', async () => {
      const { findByText } = render()
      expect(await findByText(/Loading/)).toBeInTheDocument()
    })

    describe('after the GET rubric resolves', () => {
      beforeEach(() => {
        stubs.push(getRubricStub())
        stubs.push(getScoresStub())
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

          const scoreNameInput = await findByLabelText(new RegExp(`${rubric.descriptor} for this Scoring`))
          await user.clear(scoreNameInput)
          await user.type(scoreNameInput, '123 Main St')
          await user.keyboard('{enter}')

          const weight1 = await findByText(/Weight 1/)
          await user.click(await within(weight1.parentElement!).findByLabelText('5'))

          const weight2 = await findByText(/Weight 2/)
          await user.click(await within(weight2.parentElement!).findByLabelText('1'))

          const button = await findByText('Save')
          await user.click(button)

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
