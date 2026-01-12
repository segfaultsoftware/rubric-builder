import React, { useState } from 'react'

import classNames from 'classnames'

import { round } from 'lodash'
import styles from './ScoreSummary.module.scss'
import { type Rubric } from '../../types/Rubric'
import { type Weight } from '../../types/Weight'
import { type Profile } from '../../types/Profile'

interface ScoreSummaryProps {
  calculationsByUserWeight: Record<string, Record<string, number>>
  profileById: Map<number, Profile>
  scoreName: string
  rubric: Rubric
  weightById: Map<number, Weight>
}

const ScoreSummary = ({
  calculationsByUserWeight,
  scoreName,
  rubric,
  profileById,
  weightById
}: ScoreSummaryProps) => {
  const [isShowingDetails, setIsShowingDetails] = useState(false)

  const header = `Scores for ${rubric.descriptor}: ${scoreName}`
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
              const weight = weightById.get(weightId)
              const weightName = weight?.name ?? 'Total'
              const weightImageUrl = weight?.imageUrl

              return (
                <tr key={weightId}>
                  <td>
                    <div className='text-center'>
                      {weightImageUrl && (
                        <img
                          src={weightImageUrl}
                          alt={weightName}
                          className={`${styles.weightImage} mb-1`}
                        />
                      )}
                      <div>{weightName}</div>
                    </div>
                  </td>
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
      <header><h2>{header}</h2></header>
      <div className='row mb-5 mb-md-0'>
        <div role='button' className='col-1 md-text-end d-none d-md-block' onClick={() => { setIsShowingDetails(!isShowingDetails) }}>
          <i className={classNames('bi', { 'bi-chevron-double-right': !isShowingDetails, 'bi-chevron-double-down': isShowingDetails })}></i>
        </div>
        <div className='col-11'>
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
