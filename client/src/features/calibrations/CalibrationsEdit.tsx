import React, { useEffect, useState } from 'react'

import { shuffle } from 'lodash'
import ProgressBar from '@ramonak/react-progress-bar'
import { Link, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  fetchRubric,
  selectRubric,
  updateCalibrationsForRubric,
  selectWeightByWeightId,
  resetRubricState
} from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'
import { type Weight } from '../../types/Weight'
import { type Calibration } from '../../types/Calibration'

interface CalibrationsEditProps {
  useRandom?: boolean
}

const calibrationsEditPropsDefaults: CalibrationsEditProps = {
  useRandom: true
}
const CalibrationsEdit = (options: CalibrationsEditProps) => {
  const { useRandom } = { ...calibrationsEditPropsDefaults, ...options }
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const weightsById = useAppSelector(selectWeightByWeightId)

  const [isStarting, setIsStarting] = useState<boolean>(true)
  const [isAssigned, setIsAssigned] = useState<boolean>(false)
  const [rating, setRating] = useState<number>(0.0)
  const [pairings, setPairings] = useState<number[][]>([])
  const [fromWeight, setFromWeight] = useState<Weight | undefined>(undefined)
  const [toWeight, setToWeight] = useState<Weight | undefined>(undefined)

  useEffect(() => {
    return function cleanup () {
      dispatch(resetRubricState())
    }
  }, [])

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (rubric?.pairings?.length && pairings.length === 0 && isStarting) {
      setPairings(useRandom ? shuffle(rubric.pairings) : rubric.pairings)
      setIsStarting(false)
    } else if (rubric && pairings.length && !isAssigned) {
      const flipIt = !!useRandom && Math.floor(Math.random() * 10) % 2 === 1

      if (flipIt) {
        setFromWeight(weightsById.get(pairings[0][1]))
        setToWeight(weightsById.get(pairings[0][0]))
      } else {
        setFromWeight(weightsById.get(pairings[0][0]))
        setToWeight(weightsById.get(pairings[0][1]))
      }
      setRating(0)
      setIsAssigned(true)
    }
  }, [rubric, pairings, isStarting, isAssigned])

  const handleCalibrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseFloat(e.target.value))
  }

  const handleSave = async () => {
    if (loggedInAs && rubric && fromWeight && toWeight) {
      const absRating = Math.abs(rating)
      const toNine = absRating + 1
      const normalized = rating > 0 ? (1 / toNine) : toNine

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const calibration: Calibration = { fromWeightId: fromWeight.id!, toWeightId: toWeight.id!, rating: normalized }

      const newPairings = pairings.slice(1)
      setPairings(newPairings)
      setIsAssigned(false)

      dispatch(updateCalibrationsForRubric({ rubric, calibration }))
    }
  }

  const totalCombinations = rubric ? (rubric.weights.length * (rubric.weights.length - 1)) / 2 : 1
  const percentCompleted = (1 - pairings.length / totalCombinations) * 100

  const renderPicker = () => {
    return (
      <>
        <div className='row'>
          <div className='col-4'>{fromWeight?.name}</div>
          <div className='col-4 offset-4'>{toWeight?.name}</div>
        </div>
        <div className='col-md-6 offset-md-3'>
          <div className='w-100'>
            <input
              id='picker'
              type='range'
              min="-8"
              max="8"
              step="1"
              value={rating}
              onChange={handleCalibrationChange}
              className='w-100'
            />
          </div>
          <label className='mb-2' htmlFor='picker'>Choose</label>
        </div>
      </>
    )
  }

  const renderRestart = () => {
    return (
      <button type='button' className='btn btn-link' onClick={() => { setIsStarting(true) }}>
        Restart
        <i className="bi bi-repeat"></i>
      </button>
    )
  }

  return loggedInAs && rubric && fromWeight && toWeight
    ? (
    <div className='text-center col-md-8 offset-md-2'>
      <div className='row text-center'>
        <div className='col'>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores/new`}>Score</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores`}>Analyze</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/edit`} title='Edit'>Edit</Link>
        </div>
      </div>
      <header><h1>Calibrate {rubric.name}</h1></header>
      <form>
        <div className='row mb-3'>
          {pairings.length > 0 ? renderPicker() : renderRestart()}
        </div>
        {pairings.length > 0 && (
          <div>
            <button className='btn btn-primary' type='button' onClick={handleSave}>Save</button>
          </div>
        )}
        <div className='w-100 fixed-bottom'>
          <ProgressBar
            completed={percentCompleted}
            height={'10px'}
            isLabelVisible={false}
            borderRadius={'0'}
          />
        </div>
      </form>
    </div>
      )
    : (
    <div>Loading...</div>
      )
}

export default CalibrationsEdit
