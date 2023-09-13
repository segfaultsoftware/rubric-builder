import React from 'react'
import Select from 'react-select'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addMemberToRubric, removeMemberFromRubric, selectRubric } from './rubricSlice'
import { type Profile, selectAllProfiles } from '../profile/profileSlice'

const RubricMembers = () => {
  const dispatch = useAppDispatch()

  const rubric = useAppSelector(selectRubric)
  const profiles = useAppSelector(selectAllProfiles)
  const notYetMembers = rubric
    ? profiles.filter((profile) => {
      const index = rubric.members.findIndex((member) => member.id === profile.id)
      return index < 0
    })
    : []

  const handleAddMember = (profile: Profile | null) => {
    if (profile && rubric) {
      dispatch(addMemberToRubric({ rubric, profile }))
    }
  }

  const handleRemoveMember = (profile: Profile) => {
    if (profile && rubric) {
      if (confirm(`Are you sure you want to remove ${profile.displayName}?`)) {
        dispatch(removeMemberFromRubric({ rubric, profile }))
      }
    }
  }

  return rubric
    ? (
    <div className='row'>
      <header><h3>Members</h3></header>
      <div className='col-lg-12'>
        <ul className='list-group'>
          {rubric.members.map((member) => {
            return (
              <li key={member.id} className='list-group-item'>
                <span className='me-2'>{member.displayName}</span>
                <span

                  role='button'
                  onClick={() => { handleRemoveMember(member) }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <label>Add Member</label>
      <Select
        value={null}
        options={notYetMembers}
        getOptionLabel={(option) => option?.displayName ?? 'Choose'}
        getOptionValue={(option) => '' + option?.id}
        onChange={handleAddMember}
      />
    </div>
      )
    : (
    <>nada</>
      )
}

export default RubricMembers
