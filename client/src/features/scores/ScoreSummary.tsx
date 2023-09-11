import React, { useState } from 'react'

import { type Profile } from '../profile/profileSlice'
import { type Weight } from '../rubric/rubricSlice'

interface ScoreSummaryProps {
  calculationsByUserWeight: Map<number, Map<number, number>>
  profileById: Map<number, Profile>
  scoreName: string
  weightById: Map<number, Weight>
}

const ScoreSummary = ({
  calculationsByUserWeight,
  scoreName,
  profileById,
  weightById
}: ScoreSummaryProps) => {
  const [isShowingDetails, setIsShowingDetails] = useState(false)

  const header = `Scores for ${scoreName}`
  const userIds = Array.from(calculationsByUserWeight.keys())
  const weightIds = Array.from(weightById.keys())

  const DetailLine = () => {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>&nbsp;</th>
              {userIds.map((userId) => <th key={userId}>{profileById.get(userId)?.displayName}</th>)}
            </tr>
          </thead>
          <tbody>
            {[-1, ...weightIds].map((weightId) => {
              const weightName = weightById.get(weightId)?.name ?? 'Total'

              return (
                <tr key={weightId}>
                  <td>{weightName}</td>
                  {userIds.map((userId) => {
                    const calculation = calculationsByUserWeight.get(userId)?.get(weightId)
                    return <td key={userId}>{calculation}</td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const SummaryLine = ({ userId }: { userId: number }) => {
    const userName = profileById.get(userId)?.displayName
    const totalScore = calculationsByUserWeight.get(userId)?.get(-1)

    return (
      <div>Total for {userName}: {totalScore}</div>
    )
  }

  return (
    <div>
      <header>
        <div className={'chevron'} onClick={() => {
          setIsShowingDetails(!isShowingDetails)
        }}>V</div>
        {header}
      </header>
      <div>
        {!isShowingDetails && userIds.map((userId) => <SummaryLine key={userId} userId={userId} />)}
        {isShowingDetails && <DetailLine />}
      </div>
    </div>
  )
}

export default ScoreSummary
