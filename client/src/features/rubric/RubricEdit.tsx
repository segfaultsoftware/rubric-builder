import React, { useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'
import classNames from 'classnames'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, resetRubricState, selectRubric, selectSaveRubricState, updateRubric } from './rubricSlice'
import RubricForm from './RubricForm'
import { selectLoggedInAs } from '../profile/profileSlice'
import RubricMembers from './RubricMembers'

import styles from './RubricEdit.module.scss'
import { type Rubric, RubricVisibility } from '../../types/Rubric'

interface Notification {
  id: number
  message: string
}

const RubricEdit = () => {
  const dispatch = useAppDispatch()
  const fetchedRubric = useAppSelector(selectRubric)
  const author = useAppSelector(selectLoggedInAs)
  const saveState = useAppSelector(selectSaveRubricState)
  const { rubricId } = useParams()

  const [hasFetched, setHasFetched] = useState(false)
  const [rubric, setRubric] = useState<Rubric>({
    name: '',
    descriptor: 'Address',
    visibility: RubricVisibility.MembersOnly,
    weights: [],
    members: []
  })
  const [notifications, setNotifications] = useState<Notification[]>([])

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
    if (fetchedRubric) {
      setRubric(fetchedRubric)
      setHasFetched(true)
    }
  }, [fetchedRubric])

  useEffect(() => {
    if (saveState === 'saved') {
      const savedAt = new Date()
      const notification: Notification = {
        id: savedAt.getTime(),
        message: `Saved at ${savedAt.toString()}`
      }
      setNotifications([...notifications, notification])
    }
  }, [saveState])

  const handleAddNotification = (message: string) => {
    const notification: Notification = {
      id: new Date().getTime(),
      message
    }
    setNotifications([...notifications, notification])
  }

  const handleSubmit = (modifiedRubric: Rubric) => {
    dispatch(updateRubric(modifiedRubric))
  }

  if (!author) {
    return <div>Loading...</div>
  }

  return hasFetched
    ? (
    <div className='text-center col-lg-6 offset-lg-3'>
      <div className='row'>
        <div className='col'>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores/new`}>Score</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores`}>Analyze</Link>
          <Link className='btn btn-link p-1' to={`/calibrations/${rubric.id}/edit`}>Calibrate</Link>
        </div>
      </div>
      <header><h1>Edit a Rubric</h1></header>
      {notifications.length > 0 && (
        <ul className='ps-0'>
          {notifications.map((notification) => (
            <li className={classNames(styles.notification, 'alert alert-info')} key={notification.id}>{notification.message}</li>
          ))}
        </ul>
      )}
      <RubricForm
        author={author}
        rubric={rubric}
        onRubricChange={setRubric}
        onSubmit={handleSubmit}
      />
      <RubricMembers onAddNotification={handleAddNotification} />
    </div>
      )
    : (
    <div>
      Loading...
    </div>
      )
}

export default RubricEdit
