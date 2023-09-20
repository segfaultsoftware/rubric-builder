import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, selectRubric, type Weight } from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'
import {
  clearCreateScoreStatus,
  createScore, fetchScoresForRubricId,
  type Score,
  type ScoreWeight,
  selectCreateScoreStatus,
  selectUniqueScoreNames
} from './scoreSlice'
import WeightScore from './WeightScore'
import CreatableSelect from 'react-select/creatable'
import { type SelectInstance } from 'react-select'

interface SelectOption {
  label: string
  value: string
}
const ScoreNew = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { rubricId } = useParams()

  const selectRef = useRef<SelectInstance<SelectOption> | null>(null)

  const loggedInAs = useAppSelector(selectLoggedInAs)
  const rubric = useAppSelector(selectRubric)
  const createScoreStatus = useAppSelector(selectCreateScoreStatus)
  const existingScores = useAppSelector(selectUniqueScoreNames)

  const [scoreName, setScoreName] = useState('')
  const [scores, setScores] = useState(new Map())

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
      dispatch(fetchScoresForRubricId(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (rubric) {
      const defaultScores = new Map()
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
    } else if (rubric && scores.size !== rubric.weights.length) {
      alert('Must score all weights')
    } else if (scoreName && loggedInAs && rubricId) {
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
  const hasIncompleteRatings = scores.size !== rubric?.weights.length
  const isInvalid = hasInvalidName || hasIncompleteRatings

  return rubric && loggedInAs
    ? (
    <div className='row'>
      <div className='row text-center'>
        <div className='col'>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores`}>Analyze</Link>
          <Link className='btn btn-link p-1' to={`/calibrations/${rubric.id}/edit`}>Calibrate</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/edit`} title='Edit'>Edit</Link>
        </div>
      </div>
      <form className='container text-center'>
        <header><h1>Score {rubric.name}</h1></header>
        <div className='col-md-6 offset-md-3'>
          <label className='form-label w-100' htmlFor={selectRef.current?.inputRef?.id}>
            {rubric.descriptor} for this Scoring
            <CreatableSelect
              ref={selectRef}
              isClearable
              options={existingScores.map(score => ({ label: score, value: score }))}
              onChange={(e) => { setScoreName(e?.value ?? '') }}
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
            disabled={isInvalid}
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
