import React from 'react'

import { Link } from 'react-router-dom'

import { useAppSelector } from './app/hooks'
import { selectLoggedInAs } from './features/profile/profileSlice'
import RegisterPage from './features/profile/RegisterPage'

const HomePage = () => {
  const loggedInAs = useAppSelector(selectLoggedInAs)

  return (
    <div className='row align-items-center'>
      <div className='col-lg-7 text-lg-start'>
        <h1 className='display-4 fw-bold lh-1 text-body-emphasis mb-3'>Welcome to the Rubric Builder</h1>
        <div className='col-lg-10 fs-4'>
          Easy to use!
          <ol>
            <li><Link to={'/register'}>Sign Up!</Link></li>
            <li>Create a <Link to={'/rubrics/new'}>new Rubric</Link></li>
            <li>Add Weights</li>
            <li>Invite People</li>
            <li>Record a Metric</li>
            <li>View Comparisons of All Your Metrics in a Rubirc</li>
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
