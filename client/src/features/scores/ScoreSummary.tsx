import React, { useState } from 'react'

import classNames from 'classnames'

import { type Profile } from '../profile/profileSlice'
import { type Weight } from '../rubric/rubricSlice'
import { round } from 'lodash'

interface ScoreSummaryProps {
  calculationsByUserWeight: Record<string, Record<string, number>>
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
  const userIds = Array.from(Object.keys(calculationsByUserWeight))
  const weightIds = Array.from(weightById.keys())

  const DetailLine = () => {
    return (
      <div>
        <table className='table table-striped-columns'>
          <thead>
            <tr>
              <th>&nbsp;</th>
              {userIds.map((userId) => <th key={userId}>{profileById.get(parseInt(userId))?.displayName}</th>)}
            </tr>
          </thead>
          <tbody>
            {[-1, ...weightIds].map((weightId) => {
              const weightName = weightById.get(weightId)?.name ?? 'Total'

              return (
                <tr key={weightId}>
                  <td>{weightName}</td>
                  {userIds.map((userId) => {
                    const calculation = round(calculationsByUserWeight[userId][weightId], 3)
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

  const SummaryLine = ({ userId, onChevronClick }: { userId: string, onChevronClick: () => void }) => {
    const userName = profileById.get(parseInt(userId))?.displayName
    const totalScore = round(calculationsByUserWeight[userId]['-1'], 3)

    return (
      <div className='row'>
        <div className='col'>Total for {userName}: {totalScore}</div>
      </div>
    )
  }

  return (
    <div>
      <header><h2 className='text-center'>{header}</h2></header>
      <div className='row mb-5 mb-md-0'>
        <div role='button' className='offset-md-2 col-md-1 md-text-end d-none d-md-block' onClick={() => { setIsShowingDetails(!isShowingDetails) }}>
          <i className={classNames('bi', { 'bi-chevron-double-right': !isShowingDetails, 'bi-chevron-double-down': isShowingDetails })}></i>
        </div>
        <div className='col-md-7'>
          {!isShowingDetails && userIds.map((userId) => (
            <SummaryLine key={userId} userId={userId} onChevronClick={() => { setIsShowingDetails(!isShowingDetails) }}/>
          ))}
          {isShowingDetails && <DetailLine />}
        </div>
      </div>
    </div>
  )
}

export default ScoreSummary
