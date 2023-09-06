import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, selectRubric, type Weight } from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'
import { clearCreateScoreStatus, createScore, type Score, type ScoreWeight, selectCreateScoreStatus } from './scoreSlice'

const ScoreNew = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { rubricId } = useParams()

  const loggedInAs = useAppSelector(selectLoggedInAs)
  const rubric = useAppSelector(selectRubric)
  const createScoreStatus = useAppSelector(selectCreateScoreStatus)

  const [scoreName, setScoreName] = useState('')
  const [scores, setScores] = useState(new Map())

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (rubric) {
      const defaultScores = new Map()
      rubric.weights.forEach((weight) => {
        defaultScores.set(weight.id, 1)
      })
      setScores(defaultScores)
    }
  }, [rubric])

  useEffect(() => {
    if (createScoreStatus === 'Created') {
      dispatch(clearCreateScoreStatus())
      navigate(`/rubrics/${rubricId}/scores`)
    }
  }, [createScoreStatus])

  const handleChange = (weight: Weight, inputValue: string | number) => {
    const newScores = new Map(scores)
    newScores.set(weight.id, inputValue)
    setScores(newScores)
  }

  const handleSave = () => {
    if (loggedInAs && rubricId) {
      const scoreWeights: ScoreWeight[] = Array.from(scores.keys()).map((weightId) => {
        return {
          weightId,
          value: scores.get(weightId)
        }
      })
      const score: Score = {
        name: scoreName,
        profileId: loggedInAs.id,
        rubricId: parseInt(rubricId),
        scoreWeights
      }
      dispatch(createScore(score))
    }
  }

  const renderWeightScore = (weight: Weight) => {
    return (
      <div key={weight.id}>
        <label>{weight.name} (?)</label>
        <input
          type='range'
          name={`range:${weight.name}`}
          min="0"
          max="5"
          step="1"
          value={scores.get(weight.id)}
          onChange={(e) => { handleChange(weight, e.target.value) }}
        />
        <input
          type='text'
          name={`text:${weight.name}`}
          value={scores.get(weight.id)}
          disabled
        />
      </div>
    )
  }

  const hasInvalidName = !scoreName

  return rubric && loggedInAs && scores.size
    ? (
    <>
      <header><h1>Score a Property</h1></header>
      <div>
        <label>Name for this Scoring</label>
        <input
          type='text'
          value={scoreName}
          onChange={(e) => { setScoreName(e.target.value) }}
        />
        {hasInvalidName && <span>Requires a score name</span>}
      </div>
      {rubric.weights.map((weight) => renderWeightScore(weight))}
      <div>
        <button type='button' onClick={handleSave}>Save</button>
      </div>
    </>
      )
    : <div>Loading</div>
}

export default ScoreNew
