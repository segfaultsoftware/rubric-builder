import React, { useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  clearSaveCalibrationState,
  fetchRubric,
  selectRubric,
  selectSaveCalibrationsState,
  updateCalibrationsForRubric,
  type Weight,
  type Calibration
} from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'

interface CalibrationsEditProps {
  useRandom?: boolean
}

const calibrationsEditPropsDefaults: CalibrationsEditProps = {
  useRandom: false
}
const CalibrationsEdit = ({ useRandom }: CalibrationsEditProps = calibrationsEditPropsDefaults) => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const saveState = useAppSelector(selectSaveCalibrationsState)

  const [rating, setRating] = useState<number>(0.0)
  const [fromWeightIndex, setFromWeightIndex] = useState<number>(0)
  const [fromWeight, setFromWeight] = useState<Weight | null>(null)
  const [toWeightIndex, setToWeightIndex] = useState<number>(1)
  const [toWeight, setToWeight] = useState<Weight | null>(null)

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (rubric && saveState === 'saved') {
      const numWeights = rubric.weights.length
      if (toWeightIndex + 1 >= numWeights) {
        if (fromWeightIndex + 2 >= numWeights) {
          setFromWeightIndex(0)
          setToWeightIndex(1)
        } else {
          setFromWeightIndex(fromWeightIndex + 1)
          setToWeightIndex(fromWeightIndex + 2)
        }
      } else {
        setToWeightIndex(toWeightIndex + 1)
      }
      dispatch(clearSaveCalibrationState())
    }
  }, [rubric, saveState, toWeightIndex, fromWeightIndex])

  useEffect(() => {
    if (rubric) {
      setFromWeight(rubric.weights[fromWeightIndex])
      setToWeight(rubric.weights[toWeightIndex])
      setRating(0)
    }
  }, [rubric, fromWeightIndex, toWeightIndex])

  const handleCalibrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseFloat(e.target.value))
  }

  const handleSave = () => {
    if (loggedInAs && rubric && fromWeight && toWeight) {
      const absRating = Math.abs(rating)
      const toNine = absRating + 1
      const normalized = rating >= 0 ? toNine : (1 / toNine)

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const calibration: Calibration = { fromWeightId: fromWeight.id!, toWeightId: toWeight.id!, rating: normalized }

      dispatch(updateCalibrationsForRubric({ rubric, calibration }))
    }
  }

  const isDisabled = saveState === 'pending'

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
          <div className='col'>{fromWeight.name}</div>
          <div className='col'>
            <label className='mb-2' htmlFor='picker'>I favor</label>
            <div>
              <input
                id='picker'
                type='range'
                min="-8"
                max="8"
                step="1"
                value={rating}
                onChange={handleCalibrationChange}
                disabled={isDisabled}
              />
            </div>
          </div>
          <div className='col'>{toWeight.name}</div>
        </div>
        <div>
          <button className='btn btn-primary' type='button' disabled={isDisabled} onClick={handleSave}>Save</button>
        </div>
      </form>
    </div>
      )
    : (
    <div>Loading...</div>
      )
}

export default CalibrationsEdit
