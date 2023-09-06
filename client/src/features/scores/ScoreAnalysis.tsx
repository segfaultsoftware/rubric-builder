import React, {useEffect} from 'react'
import {useParams} from "react-router-dom";

import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchRubric, selectRubric, Weight} from "../rubric/rubricSlice";
import {fetchScoresForRubricId, Score, ScoreWeight, selectScoresForRubric} from "./scoreSlice";
import {fetchProfiles, Profile, selectAllProfiles} from "../profile/profileSlice";

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

  const profileLookup: Map<number | undefined, Profile> = new Map()
  profiles.forEach((profile) => profileLookup.set(profile.id, profile))

  const weightLookup: Map<number | undefined, Weight> = new Map()
  if (rubric) {
    rubric.weights.forEach((weight) => weightLookup.set(weight.id, weight))
  }

  const renderScore = (score: Score) => {
    const author = profileLookup.get(score.profileId)?.displayName || 'Unknown'
    const scoreTitle = `${score.name} by ${author}`
    const totalScore = score.scoreWeights.reduce((prev, curr) => prev + curr.value, 0)

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
                  <td key={scoreWeight.id}>{scoreWeight.value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return rubric && profiles.length ? (
    <>
      <header><h1>Analysis for {rubric.name}</h1></header>
      {scores.map((score) => renderScore(score))}
    </>
  ) : <div>Loading...</div>
}

export default ScoreAnalysis
