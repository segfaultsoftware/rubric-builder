import React, { useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { sendInvite } from './invitationsSlice'

const Invite = () => {
  const dispatch = useAppDispatch()

  const [email, setEmail] = useState<string>('')
  const [hasInvited, setHasInvited] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setHasInvited(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (email) {
      dispatch(sendInvite(email))
      setEmail('')
      setHasInvited(true)
    }
  }

  return (
    <div className='col-md-10 mx-auto col-lg-5 border rounded-3 bg-body-tertiary p-4 p-md-5'>
      <div className='mb-5'>
        Invite a friend. Especially helpful for group trips and big purchases.
      </div>
      <form onSubmit={handleSubmit}>
        <div className='mb-2'>
          <label className='form-label w-100'>
            Email address
            <input
              type='email'
              name='email'
              value={email}
              onChange={handleChange}
              className='form-control'
            />
          </label>
        </div>
        <div>
          <button type='submit' className='btn btn-primary me-4'>Invite!</button>
          {hasInvited && <em className='text-success'><i className="bi bi-check-circle-fill"></i></em>}
        </div>
      </form>
    </div>
  )
}

export default Invite
