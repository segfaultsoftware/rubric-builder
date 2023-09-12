import React from 'react'

import { logout, selectLoggedInAs } from './profileSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import UnauthenticatedUserControls from './UnauthenticatedUserControls'
import AuthenticatedControls from './AuthenticatedControls'

const ProfileBadge = () => {
  const dispatch = useAppDispatch()
  const loggedInAs = useAppSelector(selectLoggedInAs)

  const handleLogout = () => {
    dispatch(logout())
  }

  return loggedInAs
    ? <AuthenticatedControls loggedInAs={loggedInAs} onLogout={handleLogout} />
    : <UnauthenticatedUserControls />
}

export default ProfileBadge
