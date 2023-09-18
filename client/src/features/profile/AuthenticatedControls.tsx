import React from 'react'
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
    <div className='text-end'>
      <div className='text-end d-none d-md-block'>{loggedInAs.displayName}</div>
      <div className='text-end'><button className='btn btn-link p-0' onClick={handleLogout}>Logout</button></div>
    </div>
  )
}

export default AuthenticatedControls
