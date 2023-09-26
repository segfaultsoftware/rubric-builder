import React from 'react'

import { type ProfileAuthentication } from '../../types/Profile'

interface ProfileFormProps {
  errors: string[]
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isRegister?: boolean
  setProfile: (profile: ProfileAuthentication) => void
  submitLabel: string
  profile: ProfileAuthentication
}

const profileFormDefaults: Partial<ProfileFormProps> = {
  errors: [],
  isRegister: false
}

const ProfileForm = (params: ProfileFormProps) => {
  const {
    errors,
    handleSubmit,
    isRegister,
    setProfile,
    submitLabel,
    profile
  } = { ...profileFormDefaults, ...params }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const renderErrors = () => {
    return (
      <div className='alert alert-danger' role='alert'>
        {errors.map(error => (
          <div key={error}>{error}</div>
        ))}
      </div>
    )
  }

  return (
      <div>
        {errors.length > 0 && renderErrors()}
        <form onSubmit={handleSubmit}>
          <div className='mb-2'>
            <label className='form-label w-100'>
              Email address
              <input
                type='email'
                name='email'
                value={profile.email}
                onChange={handleChange}
                aria-describedby='emailHelp'
                className='form-control'
              />
              <div id='emailHelp' className='form-text'>
                We will never share your email with anyone else.
              </div>
            </label>
          </div>
          <div className='mb-2'>
            <label className='form-label w-100'>
              Password
              <input
                type="password"
                name="password"
                value={profile.password}
                onChange={handleChange}
                className='form-control'
              />
            </label>
          </div>
          {isRegister && (
            <div className='mb-4'>
              <label className='form-label w-100'>
                Password Confirmation
                <input
                  type='password'
                  name='passwordConfirmation'
                  value={profile.passwordConfirmation}
                  onChange={handleChange}
                  className='form-control'
                />
              </label>
            </div>
          )}
          <div>
            <button type='submit' className='btn btn-primary'>{submitLabel}</button>
          </div>
        </form>
      </div>
  )
}

export default ProfileForm
