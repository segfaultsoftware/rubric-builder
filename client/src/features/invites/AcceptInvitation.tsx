import React, { useEffect, useState } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  getInvitation,
  clearAcceptInvitationState,
  selectAcceptInvitationStatus,
  type Invitation,
  selectInvitation, acceptInvitation
} from './invitationsSlice'

const AcceptInvitation = () => {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const acceptInvitationStatus = useAppSelector(selectAcceptInvitationStatus)
  const invitationFromServer = useAppSelector(selectInvitation)

  const [invitation, setInvitation] = useState<Invitation>({
    id: -1,
    invitationToken: searchParams.get('invitation_token') ?? '',
    email: ''
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
    } else if (!invitation.password) {
      alert('Requires a password')
    } else if (invitation.password !== invitation.passwordConfirmation) {
      alert('Password and confirmation do not match')
    }
  }

  return (
    <div>
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
        </div>
        <div>
          <button type='submit' className='btn btn-primary'>Join</button>
        </div>
      </form>
    </div>
  )
}

export default AcceptInvitation
