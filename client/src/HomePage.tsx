import React, { useEffect } from 'react'

import { Link } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from './app/hooks'
import { selectLoggedInAs } from './features/profile/profileSlice'
import RegisterPage from './features/profile/RegisterPage'
import { fetchRubrics, selectRubrics } from './features/rubric/rubricSlice'
import classNames from 'classnames'

const HomePage = () => {
  const dispatch = useAppDispatch()
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const rubrics = useAppSelector(selectRubrics)

  const currentRubric = rubrics.length ? rubrics[0] : null
  const hasWeights = currentRubric && currentRubric?.weights?.length > 0
  const hasMembers = currentRubric && currentRubric.members.length > 1

  useEffect(() => {
    dispatch(fetchRubrics())
  }, [])

  return (
    <div className='row align-items-center'>
      <div className='col-lg-7 text-lg-start'>
        <h1 className='display-4 fw-bold lh-1 text-body-emphasis mb-3'>Welcome to the Rubric Builder</h1>
        <div className='col-lg-10 fs-4'>
          Easy to use!
          <ol>
            <li className={classNames({ 'text-decoration-line-through': loggedInAs })}>
              <Link to={'/register'}>Sign Up!</Link>
            </li>
            <li className={classNames({ 'text-decoration-line-through': rubrics.length })}>
              Create a <Link to={'/rubrics/new'}>new Rubric</Link>
            </li>
            <li className={classNames({ 'text-decoration-line-through': hasWeights })}>
              {currentRubric
                ? (
                <Link to={`/rubrics/${currentRubric.id}/edit`}>Add Weights</Link>
                  )
                : (
                  <>Add Weights</>
                  )}
            </li>
            <li className={classNames({ 'text-decoration-line-through': hasMembers })}>
              Invite People
            </li>
            <li>
              <span>Calibrate a Rubric</span>
              <div className='fs-6 text'>
                Playing this minigame will tell the algorithm how important certain weights are compared to each other.
              </div>
            </li>
            <li>
              <span>Score a Rubric</span>
              <div className='fs-6 text'>
                Now it&apos;s time to score something. You should be scoring a specific instance of whatever your Rubric
                is about. (ie a new home, a model of car, a job offer)
              </div>
            </li>
            <li>View Comparisons of All Your Scores in a Rubric</li>
          </ol>
        </div>
      </div>
      {!loggedInAs && (
        <div className='col-md-10 mx-auto col-lg-5'>
          <div className='border rounded-3 bg-body-tertiary p-4 p-md-5'>
            <RegisterPage isEmbedded={true} />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
