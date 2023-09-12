import React, { useEffect } from 'react'

import { Link, Outlet } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from './app/hooks'
import ProfileBadge from './features/profile/ProfileBadge'
import { getLoggedInAs, selectLoggedInAs } from './features/profile/profileSlice'

import styles from './RootLayout.module.css'

const RootLayout = () => {
  const dispatch = useAppDispatch()
  const loggedInAs = useAppSelector(selectLoggedInAs)

  useEffect(() => {
    if (!loggedInAs) {
      dispatch(getLoggedInAs())
    }
  }, [loggedInAs])

  return (
    <div>
      <header className={styles.header}>
        <div>
          <ul className={styles.links}>
            <li><Link to={'rubrics'}>Your Rubrics</Link></li>
          </ul>
        </div>

        <ProfileBadge />
      </header>
      <Outlet />
    </div>
  )
}

export default RootLayout
