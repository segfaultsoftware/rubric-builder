import React from 'react'

import { Link } from 'react-router-dom'

import { type Profile } from './profileSlice'

interface AuthenticatedControlsProps {
  loggedInAs: Profile
  onLogout: () => void
}

const AuthenticatedControls = ({ loggedInAs, onLogout }: AuthenticatedControlsProps) => {
  const handleLogout = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    onLogout()
  }

  return (
    <div className='text-end row justify-content-end'>
      <div className='text-end d-none d-md-block col-12'>{loggedInAs.displayName}</div>
      <div className='text-end col-md-3'><Link className='btn btn-link p-0' to={'/invite'}>Invite</Link></div>
      <div className='text-end col-md-3'><button className='btn btn-link p-0' onClick={handleLogout}>Logout</button></div>
    </div>
  )
}

export default AuthenticatedControls
