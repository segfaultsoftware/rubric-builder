import React from 'react'

import { Link } from 'react-router-dom'
import Logo from './Logo'
import ProfileBadge from './features/profile/ProfileBadge'

import styles from './NavBar.module.scss'

interface NavBarProps {
  isAuthenticationFlow?: boolean
}

const navBarPropsDefaults: NavBarProps = {
  isAuthenticationFlow: false
}

const NavBar = (params: NavBarProps) => {
  const { isAuthenticationFlow } = { ...navBarPropsDefaults, ...params }

  return (
    <div className="mb-3">
      <header className={styles.header}>
        <div>
          <ul className={styles.links}>
            <li><Link to={'rubrics'}>Your Rubrics</Link></li>
          </ul>
        </div>

        <div className={styles.logo}>
          <Link to={'/'}>
            <Logo />
          </Link>
        </div>

        <div className={styles.badge}>
          {!isAuthenticationFlow && <ProfileBadge />}
        </div>
      </header>
    </div>
  )
}

export default NavBar
