import React from 'react'
import { type Rubric } from './rubricSlice'
import { type Profile } from '../profile/profileSlice'
import { addStubToServer, renderWithProviders, setupServerWithStubs } from '../../utils/test-utils'
import userEvent from '@testing-library/user-event'
import RubricMembers from './RubricMembers'
import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react'

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
              profiles: [profile1, profile2, profile3]
            },
            rubric: {
              rubric,
              rubrics: [],
              saveRubricState: 'initial'
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
    const { user, findByText, findAllByRole, queryByText } = render()

    expect(await findByText('Members')).toBeInTheDocument()
    expect(await findByText(profile1.displayName, { selector: 'li' })).toBeInTheDocument()
    expect(await findByText(profile2.displayName, { selector: 'li' })).toBeInTheDocument()
    expect(queryByText(profile3.displayName)).not.toBeInTheDocument()

    const label = await findByText('Add Member')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const select = label.nextElementSibling!
    expect(select).toBeInTheDocument()

    addStubToServer(server, {
      method: 'post',
      url: '/api/v1/rubric_profiles.json',
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

    fireEvent.keyDown(select, { key: 'ArrowDown' })

    const option = await findByText(profile3.displayName)
    expect(option).toBeInTheDocument()
    await user.click(option)

    expect(await findByText(profile1.displayName, { selector: 'li' })).toBeInTheDocument()
    expect(await findByText(profile2.displayName, { selector: 'li' })).toBeInTheDocument()
    expect(await findByText(profile3.displayName, { selector: 'li' })).toBeInTheDocument()

    const removeButtons = await findAllByRole('button')
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

    await user.click(removeButtons[1])

    await waitForElementToBeRemoved(() => queryByText(profile2.displayName))
    expect(await findByText(profile1.displayName, { selector: 'li' })).toBeInTheDocument()
    expect(queryByText(profile2.displayName)).not.toBeInTheDocument()
    expect(await findByText(profile3.displayName, { selector: 'li' })).toBeInTheDocument()
  })
})
