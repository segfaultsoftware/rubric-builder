import React, {useEffect, useState} from 'react'
import Select from "react-select";
import {fetchProfiles, Profile, selectAllProfiles, selectLoggedInAs, setProfile} from "./profileSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";

const ProfileBadge = () => {
  const dispatch = useAppDispatch()
  const allProfiles = useAppSelector(selectAllProfiles)
  const loggedInAs = useAppSelector(selectLoggedInAs)

  const handleLoginSelect = (profile: Profile | null) => {
    dispatch(setProfile(profile))
  }
  
  useEffect(() => {
    dispatch(fetchProfiles())
  }, [])

  return loggedInAs ? (
    <div>Logged In As {loggedInAs.displayName}</div>
  ) : (
    <div>
      <span>Log In As:</span>
      <Select
        value={loggedInAs}
        options={allProfiles}
        getOptionLabel={(option) => option?.displayName || 'Default'}
        getOptionValue={(option) => "" + option?.id || 'Default'}
        onChange={handleLoginSelect}
      />
    </div>
  )
}

export default ProfileBadge
