import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { deleteRubric, fetchRubrics, type Rubric, selectRubrics } from './rubricSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'

const RubricIndex = () => {
  const dispatch = useAppDispatch()
  const rubrics = useAppSelector(selectRubrics)

  useEffect(() => {
    dispatch(fetchRubrics())
  }, [])

  const handleDelete = (rubric: Rubric) => {
    dispatch(deleteRubric(rubric))
  }

  const rubricList = () => {
    return rubrics.map((rubric) => {
      return (
        <li key={rubric.id} className='list-group-item btn-group'>
          <div>{rubric.name}</div>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores/new`}>Score</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores`}>Analyze</Link>
          <Link className='btn btn-link p-1' to={`/calibrations/${rubric.id}/edit`}>Calibrate</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/edit`} title='Edit'><i className="bi bi-pencil-fill"></i></Link>
          <button
            className='btn btn-link p-1'
            type='button'
            onClick={() => { handleDelete(rubric) }}
            title='Delete'
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        </li>
      )
    })
  }

  return (
    <div className='text-center col-6 offset-3'>
      <h1>Your Rubrics:</h1>
      <ul className='list-group mb-3 mt-3'>
        {rubricList()}
      </ul>
      <Link to={'/rubrics/new'} className='btn btn-primary'>
        <span>Create Rubric</span>
        <i className="ms-2 bi bi-plus-circle-fill"></i>
      </Link>
    </div>
  )
}

export default RubricIndex
