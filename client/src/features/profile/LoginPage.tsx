import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  clearAuthenticationErrors,
  login,
  selectLoggedInAs,
  selectLoginError
} from './profileSlice'
import ProfileForm from './ProfileForm'
import NavBar from '../../NavBar'
import { type ProfileAuthentication } from '../../types/Profile'

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const loggedInAs = useAppSelector(selectLoggedInAs)
  const loginError = useAppSelector(selectLoginError)

  const [profile, setProfile] = useState<ProfileAuthentication>({
    email: '',
    password: ''
  })

  useEffect(() => {
    return () => {
      dispatch(clearAuthenticationErrors())
    }
  }, [])

  useEffect(() => {
    if (loggedInAs) {
      navigate('/')
    }
  }, [loggedInAs])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(login(profile))
  }

  const errors = loginError ? ['Username or password was incorrect.'] : []

  return (
    <div className='container-sm col-xl-10 col-xxl-8 px-4 py-1'>
      <NavBar isAuthenticationFlow={true} />
      <div className='row justify-content-center'>
        <div className='col-md-10 col-lg-5 border rounded-3 bg-body-tertiary p-4 p-md-5'>
          <ProfileForm
            errors={errors}
            handleSubmit={handleSubmit}
            setProfile={setProfile}
            submitLabel={'Login'}
            profile={profile}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
