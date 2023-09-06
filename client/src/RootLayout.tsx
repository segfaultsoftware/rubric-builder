import React from 'react'

import ProfileBadge from './features/profile/ProfileBadge'
import { Link, Outlet } from 'react-router-dom'

import styles from './RootLayout.module.css'

const RootLayout = () => {
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
