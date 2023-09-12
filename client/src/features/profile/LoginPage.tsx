import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { login, type ProfileAuthentication, selectLoggedInAs, selectLoginError } from './profileSlice'
import ProfileForm from './ProfileForm'

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
    <ProfileForm
      errors={errors}
      handleSubmit={handleSubmit}
      setProfile={setProfile}
      submitLabel={'Login'}
      profile={profile}
    />
  )
}

export default LoginPage
