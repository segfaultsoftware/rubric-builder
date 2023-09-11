import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '../../app/store'
import { camelCaseKeys, fetchWrapper } from '../../api/FetchWrapper'

export interface Profile {
  id: number
  displayName: string
}

export interface ProfileState {
  loggedInAs: Profile | null
  profiles: Profile[]
}

const initialState: ProfileState = {
  loggedInAs: null,
  profiles: []
}

export const fetchProfiles = createAsyncThunk(
  'profile/fetchProfiles',
  async () => {
    const profiles = await fetchWrapper.get('/api/v1/profiles.json')
    return profiles.map((profile: any) => camelCaseKeys(profile))
  }
)

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.loggedInAs = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.profiles = action.payload
      })
  }
})

export const { setProfile } = profileSlice.actions

export const selectAllProfiles = (state: RootState) => state.profile.profiles
export const selectLoggedInAs = (state: RootState) => state.profile.loggedInAs

export const selectProfileByProfileId = createSelector(
  selectAllProfiles,
  (profiles) => {
    const profileByProfileId = new Map<number, Profile>()

    profiles.forEach((profile) => profileByProfileId.set(profile.id, profile))

    return profileByProfileId
  }
)

export default profileSlice.reducer
