import React from 'react'
import { selectLoggedInAs } from './profileSlice'
import { useAppSelector } from '../../app/hooks'

import UnauthenticatedUserControls from './UnauthenticatedUserControls'

const ProfileBadge = () => {
  const loggedInAs = useAppSelector(selectLoggedInAs)

  return loggedInAs
    ? <div>Logged In As {loggedInAs.displayName}</div>
    : <UnauthenticatedUserControls />
}

export default ProfileBadge
