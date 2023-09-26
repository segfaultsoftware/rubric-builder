import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Link, useParams } from 'react-router-dom'
import { fetchRubric, resetRubricState, selectRubric } from './rubricSlice'
import RubricForm from './RubricForm'
import { selectLoggedInAs } from '../profile/profileSlice'

const RubricViewOnly = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const loggedInAs = useAppSelector(selectLoggedInAs)
  const rubric = useAppSelector(selectRubric)

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

  return !rubric
    ? <div>Loading...</div>
    : (
    <div className='text-center col-md-6 offset-md-3'>
      <RubricForm rubric={rubric} isViewOnly />
      {loggedInAs && (
        <div className='row mb-3'>
          <div className='col-md-12'>
            <Link className='btn btn-primary' to={`/rubrics/new?copyFromId=${rubric.id}`}>Copy</Link>
          </div>
        </div>
      )}
    </div>
      )
}

export default RubricViewOnly
