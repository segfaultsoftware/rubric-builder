import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, selectRubric, type Weight } from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'
import { clearCreateScoreStatus, createScore, type Score, type ScoreWeight, selectCreateScoreStatus } from './scoreSlice'
import WeightScore from './WeightScore'

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
    const massagedValue = (typeof inputValue === 'string') ? parseInt(inputValue) : inputValue
    newScores.set(weight.id, massagedValue)
    setScores(newScores)
  }

  const handleSave = () => {
    if (!scoreName) {
      // TODO: scroll to top
      alert('Requires score name')
    }
    if (scoreName && loggedInAs && rubricId) {
      const scoreWeights: ScoreWeight[] = Array.from(scores.keys()).map((weightId) => {
        return {
          weightId,
          value: parseInt(scores.get(weightId))
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

  const hasInvalidName = !scoreName

  return rubric && loggedInAs && scores.size
    ? (
    <div className='row'>
      <form className='container text-center'>
        <header><h1>Score {rubric.name}</h1></header>
        <div className='col-6 offset-3'>
          <label className='form-label w-100'>
            Name for this Scoring
            <input
              type='text'
              value={scoreName}
              onChange={(e) => { setScoreName(e.target.value) }}
              className='form-control'
            />
          </label>
          {hasInvalidName && <div className='alert alert-warning'>Requires a score name</div>}
        </div>
        <header><h2>Weights</h2></header>
        {rubric.weights.map((weight) => (
          <WeightScore key={weight.id} weight={weight} rating={scores.get(weight.id)} onChange={e => { handleChange(weight, e.target.value) }} />
        ))}
        <div>
          <button
            type='button'
            className='btn btn-primary'
            onClick={handleSave}
            disabled={hasInvalidName}
          >
            Save
          </button>
        </div>
      </form>
    </div>
      )
    : <div>Loading</div>
}

export default ScoreNew
