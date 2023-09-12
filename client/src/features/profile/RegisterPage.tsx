import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { type ProfileAuthentication, register, selectLoggedInAs, selectRegistrationErrors } from './profileSlice'
import { useNavigate } from 'react-router-dom'
import ProfileForm from './ProfileForm'
import NavBar from '../../NavBar'

interface RegisterPageProps {
  isEmbedded?: boolean
}

const RegisterPage = ({ isEmbedded }: RegisterPageProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loggedInAs = useAppSelector(selectLoggedInAs)
  const registrationErrors = useAppSelector(selectRegistrationErrors)

  const [profile, setProfile] = useState<ProfileAuthentication>({
    email: '',
    password: '',
    passwordConfirmation: ''
  })

  useEffect(() => {
    if (loggedInAs) {
      navigate('/')
    }
  }, [loggedInAs])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(register(profile))
  }

  return isEmbedded
    ? (
    <ProfileForm
      errors={registrationErrors}
      handleSubmit={handleSubmit}
      isRegister
      setProfile={setProfile}
      submitLabel={'Register!'}
      profile={profile}
    />
      )
    : (
    <div className='container-sm'>
      <NavBar isAuthenticationFlow={true} />
      <ProfileForm
        errors={registrationErrors}
        handleSubmit={handleSubmit}
        isRegister
        setProfile={setProfile}
        submitLabel={'Register!'}
        profile={profile}
      />
    </div>
      )
}

export default RegisterPage
