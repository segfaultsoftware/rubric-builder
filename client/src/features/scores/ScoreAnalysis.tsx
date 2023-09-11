import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, selectRubric, selectWeightByWeightId } from '../rubric/rubricSlice'
import { fetchScoresForRubricId, type Score, selectScoreCalculationsMap, selectScoresForRubric } from './scoreSlice'
import { fetchProfiles, selectAllProfiles, selectProfileByProfileId } from '../profile/profileSlice'

const ScoreAnalysis = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const scores = useAppSelector(selectScoresForRubric)
  const profiles = useAppSelector(selectAllProfiles)
  const weightById = useAppSelector(selectWeightByWeightId)
  const profileById = useAppSelector(selectProfileByProfileId)
  const calculationsByScoreNameUserWeight = useAppSelector(selectScoreCalculationsMap)

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
      dispatch(fetchScoresForRubricId(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    dispatch(fetchProfiles())
  }, [])

  const renderScore = (score: Score) => {
    const author = profileById.get(score.profileId)?.displayName ?? 'Unknown'
    const scoreTitle = `${score.name} by ${author}`

    return (
      <div key={score.id}>
        <div>{scoreTitle}</div>
        <div>
          <table>
            <thead>
              <td>Total</td>
              {score.scoreWeights.map((scoreWeight) => (
                <td key={scoreWeight.id}>{weightById.get(scoreWeight.weightId)?.name}</td>
              ))}
            </thead>
            <tbody>
              <tr>
                <td>{calculationsByScoreNameUserWeight.get(score.name)?.get(score.profileId)?.get(-1)}</td>
                {score.scoreWeights.map((scoreWeight) => (
                  <td key={scoreWeight.id}>
                    {calculationsByScoreNameUserWeight.get(score.name)?.get(score.profileId)?.get(scoreWeight.weightId)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return rubric && profiles.length
    ? (
    <>
      <header><h1>Analysis for {rubric.name}</h1></header>
      {scores.map((score) => renderScore(score))}
    </>
      )
    : <div>Loading...</div>
}

export default ScoreAnalysis
