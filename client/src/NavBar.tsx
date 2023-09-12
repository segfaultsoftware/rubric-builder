import React from 'react'

import { Link } from 'react-router-dom'
import Logo from './Logo'
import ProfileBadge from './features/profile/ProfileBadge'

import styles from './NavBar.module.scss'
import classNames from 'classnames'

interface NavBarProps {
  isAuthenticationFlow?: boolean
}

const navBarPropsDefaults: NavBarProps = {
  isAuthenticationFlow: false
}

const NavBar = (params: NavBarProps) => {
  const { isAuthenticationFlow } = { ...navBarPropsDefaults, ...params }

  return (
    <header className="row mb-3 align-items-center justify-content-between">
      <div className='col-3'>
        <Link to={'rubrics'}>Your Rubrics</Link>
      </div>

      <div className={classNames(styles.logo, 'col-6')}>
        <Link to={'/'}>
          <Logo />
        </Link>
      </div>

      <div className={classNames(styles.badge, 'col-3')}>
        {!isAuthenticationFlow && <ProfileBadge />}
      </div>
    </header>
  )
}

export default NavBar
