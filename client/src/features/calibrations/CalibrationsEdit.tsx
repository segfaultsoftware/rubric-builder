import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import { toNumber } from 'lodash'
import classNames from 'classnames'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  type Calibration,
  fetchRubric,
  selectCalibrationsByUserAndWeight,
  selectRubric,
  selectSaveCalibrationsState,
  updateCalibrationsForRubric,
  type Weight
} from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'

import styles from './CalibrationsEdit.module.scss'

interface Notification {
  id: number
  message: string
}

const CalibrationsEdit = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const calibrationsByUserAndWeight = useAppSelector(selectCalibrationsByUserAndWeight)
  const saveState = useAppSelector(selectSaveCalibrationsState)

  const [calibrationsByWeight, setCalibrationsByWeight] = useState(new Map())
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (loggedInAs) {
      setCalibrationsByWeight(calibrationsByUserAndWeight.get(loggedInAs.id) ?? new Map())
    }
  }, [calibrationsByUserAndWeight, loggedInAs])

  useEffect(() => {
    if (saveState === 'saved') {
      const savedAt = new Date()
      const notification: Notification = {
        id: savedAt.getTime(),
        message: `Saved at ${savedAt.toLocaleString()}`
      }
      setNotifications([...notifications, notification])
    }
  }, [saveState])

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
    const inputId = `weight:${weight.id}`

    return calibration
      ? (
      <div key={weight.id} className='row mb-2'>
        <label className='col-sm-6 col-form-label text-end' htmlFor={inputId}>
          {weight.name}:
        </label>
        <div className='col-sm-2'>
          <input
            id={inputId}
            type="text"
            value={calibration.value}
            onChange={(e) => { handleCalibrationChange(weight, e.target.value) }}
            className='form-control'
          />
        </div>
        <div className='col-sm-4'>
          {calibration.error && (
            <div className='alert alert-info p-1 mb-0'>{calibration.error}</div>
          )}
        </div>
      </div>
        )
      : <></>
  }

  const handleSave = () => {
    if (loggedInAs && rubric) {
      const weightsToUpdate: Calibration[] = []
      const existingValuesForUser = calibrationsByUserAndWeight.get(loggedInAs.id) ?? new Map()
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

  return loggedInAs && rubric && calibrationsByWeight.size
    ? (
    <div className='text-center col-6 offset-3'>
      <header><h1>Calibrate {rubric.name}</h1></header>
      <ul>
        {notifications.map((notification) => (
          <li className={classNames(styles.notification, 'alert alert-info')} key={notification.id}>{notification.message}</li>
        ))}
      </ul>
      <form>
        {rubric.weights.map((weight) => renderCalibration(weight))}
        <div>
          <button className='btn btn-primary' type='button' disabled={hasErrors} onClick={handleSave}>Save</button>
        </div>
      </form>
    </div>
      )
    : (
    <div>Loading...</div>
      )
}

export default CalibrationsEdit
