import React from 'react'

import { useAppSelector } from './app/hooks'
import { selectLoggedInAs } from './features/profile/profileSlice'

interface Props {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
}

const AuthenticationProtected = ({ children }: Props) => {
  const loggedInAs = useAppSelector(selectLoggedInAs)

  if (!loggedInAs) {
    return <div>Must be logged in to see this page.</div>
  } else {
    return <>{children}</>
  }
}

export default AuthenticationProtected
