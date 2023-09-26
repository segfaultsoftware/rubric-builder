import React, { useEffect, useState } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  getInvitation,
  clearAcceptInvitationState,
  selectAcceptInvitationStatus,
  selectInvitation,
  acceptInvitation,
  selectAcceptInvitationErrors
} from './invitationsSlice'
import NavBar from '../../NavBar'
import { type Invitation } from '../../types/Invitation'

const AcceptInvitation = () => {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const acceptInvitationStatus = useAppSelector(selectAcceptInvitationStatus)
  const acceptInvitationErrors = useAppSelector(selectAcceptInvitationErrors)
  const invitationFromServer = useAppSelector(selectInvitation)

  const [isPasswordLongEnough, setIsPasswordLongEnough] = useState<boolean>(true)
  const [arePasswordsMatching, setArePasswordsMatching] = useState<boolean>(true)
  const [invitation, setInvitation] = useState<Invitation>({
    id: -1,
    invitationToken: searchParams.get('invitation_token') ?? '',
    email: '',
    password: ''
  })

  useEffect(() => {
    const invitationToken = searchParams.get('invitation_token')
    if (invitationToken) {
      dispatch(getInvitation(invitationToken))
    } else {
      console.error('Did not receive an invitation token, redirecting')
      navigate('/')
    }
  }, [searchParams])

  useEffect(() => {
    if (acceptInvitationStatus === 'processed') {
      dispatch(clearAcceptInvitationState())
      navigate('/')
    }
  }, [acceptInvitationStatus])

  useEffect(() => {
    if (invitationFromServer) {
      setInvitation(invitationFromServer)
    }
  }, [invitationFromServer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvitation({
      ...invitation,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (invitation.password && invitation.password === invitation.passwordConfirmation) {
      dispatch(acceptInvitation(invitation))
      setArePasswordsMatching(true)
      setIsPasswordLongEnough(true)
    } else if (!invitation.password || invitation.password.length < 12) {
      setArePasswordsMatching(true)
      setIsPasswordLongEnough(false)
    } else if (invitation.password !== invitation.passwordConfirmation) {
      setArePasswordsMatching(false)
      setIsPasswordLongEnough(true)
    }
  }

  return (
    <div className='container-sm col-xl-10 col-xxl-8 px-4 py-1'>
      <NavBar isAuthenticationFlow={true} />
      <div className='col-md-10 mx-auto col-lg-5 border rounded-3 bg-body-tertiary p-4 p-md-5 mt-3'>
        <header><h1>Set up password for your account!</h1></header>
        <form onSubmit={handleSubmit}>
          <div className='mb-2'>
            <label className='form-label w-100'>
              Email address
              <input
                type='email'
                name='email'
                value={invitation.email}
                onChange={handleChange}
                aria-describedby='emailHelp'
                className='form-control'
                disabled
              />
              <div id='emailHelp' className='form-text'>
                We will never share your email with anyone else.
              </div>
            </label>
          </div>
          {acceptInvitationErrors.length > 0 && (
            <div className='mb-2'>
              <div className='alert alert-danger'>
                {acceptInvitationErrors.map(error => <div key={error}>{error}</div>)}
              </div>
            </div>
          )}
          <div className='mb-2'>
            <label className='form-label w-100'>
              Password
              <input
                type="password"
                name="password"
                value={invitation.password}
                onChange={handleChange}
                className='form-control'
              />
            </label>
          </div>
          <div className='mb-4'>
            <label className='form-label w-100'>
              Password Confirmation
              <input
                type='password'
                name='passwordConfirmation'
                value={invitation.passwordConfirmation}
                onChange={handleChange}
                className='form-control'
              />
            </label>
            {!isPasswordLongEnough && (
              <div className='form-text text-danger'>
                Password must be at least 12 characters long.
              </div>
            )}
            {isPasswordLongEnough && !arePasswordsMatching && (
              <div className='form-text text-danger'>
                Passwords do not match.
              </div>
            )}
          </div>
          <div>
            <button type='submit' className='btn btn-primary'>Join</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AcceptInvitation
