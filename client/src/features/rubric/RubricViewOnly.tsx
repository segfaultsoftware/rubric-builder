import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useParams } from 'react-router-dom'
import { fetchRubric, resetRubricState, selectRubric } from './rubricSlice'
import RubricForm from './RubricForm'

const RubricViewOnly = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

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
    </div>
      )
}

export default RubricViewOnly
