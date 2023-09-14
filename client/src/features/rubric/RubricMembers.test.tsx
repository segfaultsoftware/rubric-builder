import React from 'react'

import userEvent from '@testing-library/user-event'
import {findByPlaceholderText, fireEvent, waitForElementToBeRemoved} from '@testing-library/react'

import { type Rubric } from './rubricSlice'
import { type Profile } from '../profile/profileSlice'
import { addStubToServer, renderWithProviders, setupServerWithStubs } from '../../utils/test-utils'
import RubricMembers from './RubricMembers'

describe('RubricMembers', () => {
  let rubric: Rubric
  let profile1: Profile
  let profile2: Profile
  let profile3: Profile

  let server: ReturnType<typeof setupServerWithStubs>

  const render = () => {
    server = setupServerWithStubs()
    server.listen()

    return {
      user: userEvent.setup(),
      ...renderWithProviders(
        <RubricMembers />,
        {
          preloadedState: {
            profile: {
              loggedInAs: profile1,
              profiles: [],
              loginError: undefined,
              registerErrors: []
            },
            rubric: {
              rubric,
              rubrics: [],
              saveRubricState: 'initial',
              saveCalibrationsState: 'initial'
            }
          }
        }
      )
    }
  }

  beforeEach(() => {
    profile1 = { id: 8, displayName: 'Profile1' }
    profile2 = { id: 9, displayName: 'Profile2' }
    profile3 = { id: 10, displayName: 'Profile3' }
    rubric = {
      id: 7,
      authorId: profile1.id,
      name: 'Rubric w Members',
      weights: [],
      members: [profile1, profile2]
    }
  })

  afterEach(() => {
    if (server) {
      server.resetHandlers()
      server.close()
    }
  })

  it('renders properly', async () => {
    const { user, findByText, findAllByRole, queryByText, findByPlaceholderText } = render()

    expect(await findByText('Members')).toBeInTheDocument()
    expect(await findByText(profile1.displayName, { selector: 'li span' })).toBeInTheDocument()
    expect(await findByText(profile2.displayName, { selector: 'li span' })).toBeInTheDocument()
    expect(queryByText(profile3.displayName)).not.toBeInTheDocument()

    const invitesRequestBodyPromise = addStubToServer(server, {
      method: 'post',
      url: '/api/v1/rubrics/:rubricId/invites.json',
      json: {}
    })
    addStubToServer(server, {
      method: 'get',
      url: `/api/v1/rubrics/${rubric.id}.json`,
      json: {
        ...rubric,
        members: [profile1, profile2, profile3]
      }
    })

    const addMemberInput = await findByPlaceholderText(/Email/)
    const user3Email = 'foo@bar.com'
    await user.type(addMemberInput, user3Email)
    await user.click(await findByText(/Add Member/))

    const invitesRequestBody = await invitesRequestBodyPromise as any
    expect(invitesRequestBody.email).toEqual(user3Email)

    expect(await findByText(profile1.displayName, { selector: 'li span' })).toBeInTheDocument()
    expect(await findByText(profile2.displayName, { selector: 'li span' })).toBeInTheDocument()
    expect(await findByText(profile3.displayName, { selector: 'li span' })).toBeInTheDocument()

    const removeButtons = await findAllByRole('button')
    // the author cannot be deleted, so 2 other members, plus Add Member button
    expect(removeButtons.length).toEqual(3)

    addStubToServer(server, {
      method: 'delete',
      url: `/api/v1/rubrics/${rubric.id}/profiles/${profile2.id}`,
      json: {}
    })
    addStubToServer(server, {
      method: 'get',
      url: `/api/v1/rubrics/${rubric.id}.json`,
      json: {
        ...rubric,
        members: [profile1, profile3]
      }
    })

    jest.spyOn(window, 'confirm').mockImplementation(() => true)

    await user.click(removeButtons[0])

    await waitForElementToBeRemoved(() => queryByText(profile2.displayName))
    expect(await findByText(profile1.displayName, { selector: 'li span' })).toBeInTheDocument()
    expect(queryByText(profile2.displayName)).not.toBeInTheDocument()
    expect(await findByText(profile3.displayName, { selector: 'li span' })).toBeInTheDocument()
  })
})
