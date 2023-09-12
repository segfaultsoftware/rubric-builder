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
    <div>
      <div>{loggedInAs.displayName}</div>
      <div><button onClick={handleLogout}>Logout</button></div>
    </div>
  )
}

export default AuthenticatedControls
