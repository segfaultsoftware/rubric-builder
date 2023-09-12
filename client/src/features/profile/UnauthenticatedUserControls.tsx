import React from 'react'
import { Link } from 'react-router-dom'

const UnauthenticatedUserControls = () => {
  return (
    <div className='text-end'>
      <div><Link to={'/register'}>Register</Link></div>
      <div><Link to={'/login'}>Login</Link></div>
    </div>
  )
}

export default UnauthenticatedUserControls
