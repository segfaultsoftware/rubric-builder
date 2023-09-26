import React, { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchTemplates, selectTemplates } from './rubricSlice'
import { Link } from 'react-router-dom'
import { RubricVisibility } from '../../types/Rubric'
import { selectLoggedInAs } from '../profile/profileSlice'

const RubricTemplates = () => {
  const dispatch = useAppDispatch()

  const loggedInAs = useAppSelector(selectLoggedInAs)
  const templates = useAppSelector(selectTemplates)

  useEffect(() => {
    dispatch(fetchTemplates())
  }, [])

  return (
    <div className='text-center col-md-6 offset-md-3'>
      <h1>Templates:</h1>
      <ul className='list-group mb-3 mt-3'>
        {templates.length === 0 && <div>Loading...</div>}
        {templates.map((rubric) => {
          const author = rubric.visibility === RubricVisibility.SystemTemplate ? 'rubric-me.com' : rubric.author?.displayName
          return (
            <li key={rubric.id} className='list-group-item btn-group'>
              <div>
                <span className='pe-2'>{rubric.name}</span>
                <small className='text-body-secondary'>by {author}</small>
              </div>
              <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/view`}>View</Link>
              {loggedInAs && <Link className='btn btn-link p-1' to={`/rubrics/new?copyFromId=${rubric.id}`}>Copy</Link>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RubricTemplates
