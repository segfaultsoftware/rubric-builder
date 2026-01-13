import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { round } from 'lodash'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, selectRubric } from '../rubric/rubricSlice'
import { selectLoggedInAs } from '../profile/profileSlice'
import {
  fetchCalibrationResults,
  resetCalibrationResultsState,
  selectCalibrationResults,
  selectCalibrationResultsFetchStatus
} from './calibrationResultsSlice'

import styles from './CalibrationResults.module.scss'

const CalibrationResults = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const calibrationResults = useAppSelector(selectCalibrationResults)
  const fetchStatus = useAppSelector(selectCalibrationResultsFetchStatus)

  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>(undefined)

  useEffect(() => {
    return function cleanup () {
      dispatch(resetCalibrationResultsState())
    }
  }, [])

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (loggedInAs && !selectedProfileId) {
      setSelectedProfileId(loggedInAs.id)
    }
  }, [loggedInAs, selectedProfileId])

  useEffect(() => {
    if (rubricId && selectedProfileId) {
      dispatch(fetchCalibrationResults({ rubricId, profileId: selectedProfileId }))
    }
  }, [rubricId, selectedProfileId])

  const handleProfileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = parseInt(event.target.value)
    setSelectedProfileId(profileId)
  }

  if (!rubric || !loggedInAs) {
    return <div>Loading...</div>
  }

  const progressPercentage = calibrationResults
    ? Math.round((calibrationResults.calibrationProgress.completed / calibrationResults.calibrationProgress.total) * 100)
    : 0

  return (
    <div className='col-md-8 offset-md-2'>
      <div className='row text-center'>
        <div className='col'>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores/new`}>Score</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores`}>Analyze</Link>
          <Link className='btn btn-link p-1' to={`/calibrations/${rubric.id}/edit`}>Calibrate</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/edit`}>Edit</Link>
        </div>
      </div>

      <header><h1 className='text-center'>Calibration Results for {rubric.name}</h1></header>

      <div className='row mb-4'>
        <div className='col'>
          <label htmlFor='memberSelect' className='form-label'>Select Member</label>
          <select
            id='memberSelect'
            className={`form-select ${styles.memberSelect}`}
            value={selectedProfileId ?? ''}
            onChange={handleProfileChange}
          >
            {rubric.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fetchStatus === 'loading' && <div>Loading calibration results...</div>}

      {fetchStatus === 'succeeded' && calibrationResults && (
        <>
          <div className='row mb-4'>
            <div className='col'>
              <h5>Calibration Progress for {calibrationResults.profile.displayName}</h5>
              <div className='progress' role='progressbar' aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`progress-bar ${styles.progressBar}`}
                  style={{ width: `${progressPercentage}%` }}
                >
                  {calibrationResults.calibrationProgress.completed} / {calibrationResults.calibrationProgress.total}
                </div>
              </div>
              <small className='text-muted'>
                {calibrationResults.calibrationProgress.remaining} comparisons remaining
              </small>
            </div>
          </div>

          <div className='row'>
            <div className='col'>
              <h5>Weight Importance (sorted by value)</h5>
              <table className='table table-striped'>
                <thead>
                  <tr>
                    <th>Weight</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrationResults.profileWeights.map((pw) => (
                    <tr key={pw.id}>
                      <td>
                        <div className='d-flex align-items-center'>
                          {pw.weight.imageUrl && (
                            <img
                              src={pw.weight.imageUrl}
                              alt={pw.weight.name}
                              className={`${styles.weightImage} me-2`}
                            />
                          )}
                          <span>{pw.weight.name}</span>
                        </div>
                      </td>
                      <td>{round(pw.value, 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {fetchStatus === 'failed' && (
        <div className='alert alert-danger'>
          Failed to load calibration results. Please try again.
        </div>
      )}
    </div>
  )
}

export default CalibrationResults
