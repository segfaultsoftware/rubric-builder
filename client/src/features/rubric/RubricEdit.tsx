import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import classNames from 'classnames'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, type Rubric, selectRubric, selectSaveRubricState, updateRubric } from './rubricSlice'
import RubricForm from './RubricForm'
import { selectLoggedInAs } from '../profile/profileSlice'
import RubricMembers from './RubricMembers'

import styles from './RubricEdit.module.scss'

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
    name: '', weights: [], members: []
  })
  const [notifications, setNotifications] = useState<Notification[]>([])

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

  const handleSubmit = (modifiedRubric: Rubric) => {
    dispatch(updateRubric(modifiedRubric))
  }

  if (!author) {
    return <div>Loading...</div>
  }

  return hasFetched
    ? (
    <div className='text-center col-lg-6 offset-lg-3'>
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
      <RubricMembers />
    </div>
      )
    : (
    <div>
      Loading...
    </div>
      )
}

export default RubricEdit
