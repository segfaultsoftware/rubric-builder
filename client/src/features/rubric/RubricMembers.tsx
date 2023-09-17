import React, { useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { inviteMemberToRubric, removeMemberFromRubric, selectRubric } from './rubricSlice'
import { type Profile } from '../profile/profileSlice'

const RubricMembers = () => {
  const dispatch = useAppDispatch()
  const rubric = useAppSelector(selectRubric)

  const [email, setEmail] = useState<string>('')
  const [isShowingInviteError, setIsShowingInviteError] = useState<boolean>(false)

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.length === 0) {
      setIsShowingInviteError(true)
    } else if (rubric) {
      setIsShowingInviteError(false)
      setEmail('')
      dispatch(inviteMemberToRubric({ rubric, email }))
    }
  }

  const handleRemoveMember = (profile: Profile) => {
    if (profile && rubric) {
      if (isAuthor(profile)) {
        alert('Cannot remove author from Rubric')
      } else if (confirm(`Are you sure you want to remove ${profile.displayName}?`)) {
        dispatch(removeMemberFromRubric({ rubric, profile }))
      }
    }
  }

  const isAuthor = (member: Profile) => {
    return rubric && member.id === rubric.authorId
  }

  return rubric
    ? (
    <div className='row'>
      <header><h3>Members</h3></header>
      <div className='col-lg-12 mb-3'>
        <ul className='list-group'>
          {rubric.members.map((member) => {
            return (
              <li key={member.id} className='list-group-item'>
                <span className='me-2'>{member.displayName}</span>
                {!isAuthor(member) && (
                  <span
                    role='button'
                    onClick={() => {
                      handleRemoveMember(member)
                    }}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <form onSubmit={handleInviteMember}>
        <div className='col-lg-12 mb-2'>
            <input
              type='email'
              placeholder='Invite by Email'
              className='form-control'
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
            />
          {isShowingInviteError && <div className='alert alert-danger mt-2'>Must be a valid email</div>}
        </div>
        <div className='col-lg-12'>
          <button type='submit' className='btn btn-primary'>
            <span>Add Member</span>
            <i className="ms-2 bi bi-plus-circle-fill"></i>
          </button>
        </div>
      </form>
    </div>
      )
    : (
    <>nada</>
      )
}

export default RubricMembers
