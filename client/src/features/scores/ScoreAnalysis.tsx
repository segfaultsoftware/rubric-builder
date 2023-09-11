import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { type Calibration, fetchRubric, selectRubric, type Weight } from '../rubric/rubricSlice'
import { fetchScoresForRubricId, type Score, selectScoresForRubric } from './scoreSlice'
import { fetchProfiles, type Profile, selectAllProfiles } from '../profile/profileSlice'

const ScoreAnalysis = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const scores = useAppSelector(selectScoresForRubric)
  const profiles = useAppSelector(selectAllProfiles)

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
      dispatch(fetchScoresForRubricId(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    dispatch(fetchProfiles())
  }, [])

  const profileLookup = new Map<number | undefined, Profile>()
  profiles.forEach((profile) => profileLookup.set(profile.id, profile))

  const weightLookup = new Map<number | undefined, Weight>()
  if (rubric) {
    rubric.weights.forEach((weight) => weightLookup.set(weight.id, weight))
  }
  const weightAndProfileToCalibration = new Map<number, Map<number, Calibration>>()
  if (rubric) {
    rubric.weights.forEach((weight) => {
      const profileToCalibration = new Map<number, Calibration>()

      weight.profileWeights.forEach((calibration) => {
        profileToCalibration.set(calibration.profileId, calibration)
      })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      weightAndProfileToCalibration.set(weight.id!, profileToCalibration)
    })
  }

  const renderScore = (score: Score) => {
    const author = profileLookup.get(score.profileId)?.displayName ?? 'Unknown'
    const scoreTitle = `${score.name} by ${author}`
    const scoreCalculations = new Map()
    let totalScore = 0
    score.scoreWeights.forEach((scoreWeight) => {
      const profileToCalibration = weightAndProfileToCalibration.get(scoreWeight.weightId)
      if (profileToCalibration) {
        const calibration = profileToCalibration.get(score.profileId)
        if (calibration) {
          const calculated = scoreWeight.value * calibration.value
          totalScore += calculated
          scoreCalculations.set(scoreWeight.weightId, calculated)
        }
      }
    })

    return (
      <div key={score.id}>
        <div>{scoreTitle}</div>
        <div>
          <table>
            <thead>
              <td>Total</td>
              {score.scoreWeights.map((scoreWeight) => (
                <td key={scoreWeight.id}>{weightLookup.get(scoreWeight.weightId)?.name}</td>
              ))}
            </thead>
            <tbody>
              <tr>
                <td>{totalScore}</td>
                {score.scoreWeights.map((scoreWeight) => (
                  <td key={scoreWeight.id}>{scoreCalculations.get(scoreWeight.weightId)}</td>
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
