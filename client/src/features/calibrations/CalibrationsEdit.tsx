import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  type Calibration,
  fetchRubric,
  selectCalibrationsByUserAndWeight,
  selectRubric,
  updateCalibrationsForRubric,
  type Weight
} from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'
import { useParams } from 'react-router-dom'
import { toNumber } from 'lodash'

const CalibrationsEdit = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const calibrationsByUserAndWeight = useAppSelector(selectCalibrationsByUserAndWeight)

  const [calibrationsByWeight, setCalibrationsByWeight] = useState(new Map())

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (loggedInAs) {
      setCalibrationsByWeight(calibrationsByUserAndWeight.get(loggedInAs.id) || new Map())
    }
  }, [calibrationsByUserAndWeight, loggedInAs])

  const handleCalibrationChange = (weight: Weight, value: string) => {
    const updatedMap = new Map(calibrationsByWeight)
    const oldCalibration = updatedMap.get(weight.id)
    const isPresentError = value.length ? null : 'Must have a value'
    const isNumberError = Number.isNaN(toNumber(value)) ? 'Must be a number' : null
    const isPositiveError = !isNumberError && toNumber(value) < 0 ? 'Must be >= 0' : null
    updatedMap.set(weight.id, {
      ...oldCalibration,
      error: isPresentError ?? isNumberError ?? isPositiveError,
      value
    })
    setCalibrationsByWeight(updatedMap)
  }

  const renderCalibration = (weight: Weight) => {
    if (!loggedInAs) {
      return <></>
    }

    const calibration = calibrationsByWeight.get(weight.id)

    return calibration
      ? (
      <div key={weight.id}>
        <label>
          {weight.name} (?):
          <input
            type="text"
            value={calibration.value}
            onChange={(e) => { handleCalibrationChange(weight, e.target.value) }}
          />
        </label>
        {calibration.error && (
          <span>{calibration.error}</span>
        )}
      </div>
        )
      : <></>
  }

  const handleSave = () => {
    if (loggedInAs && rubric) {
      const weightsToUpdate: Calibration[] = []
      const existingValuesForUser = calibrationsByUserAndWeight.get(loggedInAs.id)
      const weightIds: string[] = Array.from(existingValuesForUser.keys())

      weightIds.forEach((weightIdAsString) => {
        const weightId = parseInt(weightIdAsString)

        const oldCalibration = existingValuesForUser.get(weightId)
        const newCalibration = calibrationsByWeight.get(weightId)

        if (oldCalibration.value !== newCalibration.value) {
          weightsToUpdate.push(newCalibration)
        }
      })

      if (weightsToUpdate.length > 0) {
        dispatch(updateCalibrationsForRubric({ rubric, calibrations: weightsToUpdate }))
      }
    }
  }

  const hasErrors = Array.from(calibrationsByWeight.values()).find((calibration) => !!calibration.error)

  if (!loggedInAs) {
    return (
      <div>Please log in to use this feature</div>
    )
  }
  return rubric && calibrationsByWeight.size
    ? (
    <>
      <header><h1>Calibrate {rubric.name}</h1></header>
      {rubric.weights.map((weight) => renderCalibration(weight))}
      <div>
        <button type='button' disabled={hasErrors} onClick={handleSave}>Save</button>
      </div>
    </>
      )
    : (
    <div>Loading...</div>
      )
}

export default CalibrationsEdit
