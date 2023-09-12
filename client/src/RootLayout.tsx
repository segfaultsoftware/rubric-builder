import React, { useEffect } from 'react'

import { Outlet } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from './app/hooks'
import { getLoggedInAs, selectLoggedInAs } from './features/profile/profileSlice'

import NavBar from './NavBar'

const RootLayout = () => {
  const dispatch = useAppDispatch()
  const loggedInAs = useAppSelector(selectLoggedInAs)

  useEffect(() => {
    if (!loggedInAs) {
      dispatch(getLoggedInAs())
    }
  }, [loggedInAs])

  return (
    <div className="container-sm col-xl-10 col-xxl-8 px-4 py-1">
      <NavBar />
      <Outlet />
    </div>
  )
}

export default RootLayout
