import React from 'react'
import { Link } from 'react-router-dom'

const UnauthenticatedUserControls = () => {
  return (
    <div className='text-end'>
      <div className='col '><Link to={'/register'}>Register</Link></div>
      <div className='col'><Link to={'/login'}>Login</Link></div>
    </div>
  )
}

export default UnauthenticatedUserControls
