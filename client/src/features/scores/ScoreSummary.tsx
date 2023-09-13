import React, { useState } from 'react'

import classNames from 'classnames'

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
        <table className='table table-striped-columns'>
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

  const SummaryLine = ({ userId, onChevronClick }: { userId: number, onChevronClick: () => void }) => {
    const userName = profileById.get(userId)?.displayName
    const totalScore = calculationsByUserWeight.get(userId)?.get(-1)

    return (
      <div className='row'>
        <div className='col'>Total for {userName}: {totalScore}</div>
      </div>
    )
  }

  return (
    <div>
      <header><h2 className='text-center'>{header}</h2></header>
      <div className='row'>
        <div role='button' className='offset-2 col-lg-1 text-end' onClick={() => { setIsShowingDetails(!isShowingDetails) }}>
          <i className={classNames('bi', { 'bi-chevron-double-right': !isShowingDetails, 'bi-chevron-double-down': isShowingDetails })}></i>
        </div>
        <div className='col-lg-7'>
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
