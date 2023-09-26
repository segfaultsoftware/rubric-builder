import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  clearInviteMemberStatus,
  inviteMemberToRubric,
  removeMemberFromRubric,
  selectInviteMemberToRubricState,
  selectRubric
} from './rubricSlice'

import { type Profile } from '../../types/Profile'

interface RubricMembersProps {
  onAddNotification: (message: string) => void
}

const RubricMembers = ({ onAddNotification }: RubricMembersProps) => {
  const dispatch = useAppDispatch()
  const rubric = useAppSelector(selectRubric)
  const inviteMemberStatus = useAppSelector(selectInviteMemberToRubricState)

  const [email, setEmail] = useState<string>('')
  const [isShowingInviteError, setIsShowingInviteError] = useState<boolean>(false)

  useEffect(() => {
    if (inviteMemberStatus === 'error') {
      onAddNotification(`There was an error adding ${email} to the Rubric.`)
      dispatch(clearInviteMemberStatus())
      setEmail('')
    } else if (inviteMemberStatus === 'saved') {
      onAddNotification(`Invitation sent to ${email}!`)
      dispatch(clearInviteMemberStatus())
      setEmail('')
    }
  }, [inviteMemberStatus])

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.length === 0) {
      setIsShowingInviteError(true)
    } else if (rubric) {
      setIsShowingInviteError(false)
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
