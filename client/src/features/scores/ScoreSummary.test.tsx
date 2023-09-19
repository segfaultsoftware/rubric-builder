import React from 'react'

import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ScoreSummary from './ScoreSummary'
import { type Profile } from '../profile/profileSlice'
import { type Weight } from '../rubric/rubricSlice'

describe('ScoreSummary', () => {
  const scoreName = '555 Some Pl'
  let calculationsByUserWeight: Record<string, Record<string, number>>
  let profileById: Map<number, Profile>
  let weightById: Map<number, Weight>

  const renderPlease = () => {
    return {
      user: userEvent.setup(),
      ...render(
        <ScoreSummary
          calculationsByUserWeight={calculationsByUserWeight}
          profileById={profileById}
          scoreName={scoreName}
          weightById={weightById}
        />)

    }
  }

  beforeEach(() => {
    profileById = new Map<number, Profile>()
    profileById.set(1, { id: 1, displayName: 'User 1' })
    profileById.set(2, { id: 2, displayName: 'User 2' })
    profileById.set(3, { id: 3, displayName: 'User 3' })

    weightById = new Map<number, Weight>()
    weightById.set(1, { id: 1, name: 'Weight 1', description: '', profileWeights: [] })
    weightById.set(2, { id: 2, name: 'Weight 2', description: '', profileWeights: [] })
    weightById.set(3, { id: 3, name: 'Weight 3', description: '', profileWeights: [] })

    calculationsByUserWeight = {}
    const calculationsByWeightForUser2: Record<string, number> = {}
    calculationsByWeightForUser2['-1'] = 20
    calculationsByWeightForUser2['1'] = 5
    calculationsByWeightForUser2['2'] = 12
    calculationsByWeightForUser2['3'] = 3

    const calculationsByWeightForUser3: Record<string, number> = {}
    calculationsByWeightForUser3['-1'] = 22
    calculationsByWeightForUser3['1'] = 7
    calculationsByWeightForUser3['2'] = 11
    calculationsByWeightForUser3['3'] = 4

    calculationsByUserWeight['2'] = calculationsByWeightForUser2
    calculationsByUserWeight['3'] = calculationsByWeightForUser3
  })

  it('displays high level stats', async () => {
    const { findByText, queryByText } = renderPlease()

    expect(await findByText(`Scores for ${scoreName}`)).toBeInTheDocument()
    expect(await findByText('Total for User 2: 20')).toBeInTheDocument()
    expect(await findByText('Total for User 3: 22')).toBeInTheDocument()
    expect(queryByText('Total for User 1')).not.toBeInTheDocument()

    expect(queryByText(12)).not.toBeInTheDocument()
    expect(queryByText(11)).not.toBeInTheDocument()
  })

  it('shows details on click', async () => {
    const { user, findByText, queryByText } = renderPlease()

    const header = await findByText(`Scores for ${scoreName}`)
    const scoreSection = header.parentElement!.parentElement!
    const chevron = await within(scoreSection).findByRole('button')
    await user.click(chevron)

    expect(await findByText('Weight 1')).toBeInTheDocument()
    expect(await findByText('Weight 2')).toBeInTheDocument()
    expect(await findByText('Weight 3')).toBeInTheDocument()

    expect(await findByText('5')).toBeInTheDocument()
    expect(await findByText('12')).toBeInTheDocument()
    expect(await findByText('3')).toBeInTheDocument()
    expect(await findByText('7')).toBeInTheDocument()
    expect(await findByText('11')).toBeInTheDocument()
    expect(await findByText('4')).toBeInTheDocument()

    expect(queryByText(/Total for User 2/)).not.toBeInTheDocument()
    expect(queryByText(/Total for User 3/)).not.toBeInTheDocument()

    await user.click(chevron)

    expect(queryByText('Weight 1')).not.toBeInTheDocument()
    expect(queryByText('Weight 2')).not.toBeInTheDocument()
    expect(queryByText('Weight 3')).not.toBeInTheDocument()

    expect(queryByText('5')).not.toBeInTheDocument()
    expect(queryByText('12')).not.toBeInTheDocument()
    expect(queryByText('3')).not.toBeInTheDocument()
    expect(queryByText('7')).not.toBeInTheDocument()
    expect(queryByText('11')).not.toBeInTheDocument()
    expect(queryByText('4')).not.toBeInTheDocument()

    expect(await findByText(/Total for User 2/)).toBeInTheDocument()
    expect(await findByText(/Total for User 3/)).toBeInTheDocument()
  })
})
