import React from 'react'
import { type ProfileAuthentication } from './profileSlice'

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
      <div>
        {errors.map(error => <div key={error}>{error}</div>)}
      </div>
    )
  }

  return (
    <div>
      {/* TODO NavBar */}
      <div>
        {errors.length > 0 && renderErrors()}
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Email address
              <input
                type='email'
                name='email'
                value={profile.email}
                onChange={handleChange}
                aria-describedby='emailHelp'
              />
              <div id='emailHelp'>We will never share your email with anyone else.</div>
            </label>
          </div>
          <div>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={profile.password}
                onChange={handleChange}
              />
            </label>
          </div>
          {isRegister && (
            <div>
              <label>
                Password Confirmation
                <input
                  type='password'
                  name='passwordConfirmation'
                  value={profile.passwordConfirmation}
                  onChange={handleChange}
                />
              </label>
            </div>
          )}
          <div>
            <button type='submit'>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileForm
