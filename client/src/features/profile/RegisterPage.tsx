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
    <div className='container-sm col-xl-10 col-xxl-8 px-4 py-1'>
      <NavBar isAuthenticationFlow={true} />
      <div className='row justify-content-center'>
        <div className='col-md-10 col-lg-5 border rounded-3 bg-body-tertiary p-4 p-md-5'>
          <ProfileForm
            errors={registrationErrors}
            handleSubmit={handleSubmit}
            isRegister
            setProfile={setProfile}
            submitLabel={'Register!'}
            profile={profile}
          />
        </div>
      </div>
    </div>
      )
}

export default RegisterPage
