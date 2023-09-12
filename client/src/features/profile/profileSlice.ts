import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '../../app/store'
import { camelCaseKeys, FetchNotOkError, fetchWrapper } from '../../api/FetchWrapper'

export interface Profile {
  id: number
  displayName: string
}

export interface ProfileAuthentication {
  email: string
  password: string
  passwordConfirmation?: string
}

export interface ProfileState {
  loggedInAs: Profile | null
  profiles: Profile[]
  loginError: string | undefined
  registerErrors: string[]
}

const initialState: ProfileState = {
  loggedInAs: null,
  profiles: [],
  loginError: undefined,
  registerErrors: []
}

interface RegistrationError {
  errors: Record<string, string[]>
}

export const register = createAsyncThunk<Profile, ProfileAuthentication, { rejectValue: RegistrationError }>(
  'profile/register',
  async (profile: ProfileAuthentication, { rejectWithValue }) => {
    try {
      const json = await fetchWrapper.post('/signup.json', {
        body: { user: profile },
        useJIT: false
      })

      return camelCaseKeys(json) as Profile
    } catch (err) {
      if (err instanceof FetchNotOkError) {
        return rejectWithValue(err.payload as RegistrationError)
      }
      return rejectWithValue({
        errors: {
          Registration: [`had unhandled error ${JSON.stringify(err)}`]
        }
      })
    }
  }
)

export const login = createAsyncThunk(
  'profile/login',
  async (profile: ProfileAuthentication) => {
    const json = await fetchWrapper.post('/login.json', {
      body: { user: profile },
      useJIT: false
    })

    return camelCaseKeys(json) as Profile
  }
)

export const getLoggedInAs = createAsyncThunk(
  'profile/getLoggedInAs',
  async () => {
    const profile = await fetchWrapper.get('/current_user.json')
    return camelCaseKeys(profile) as Profile
  }
)

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
      .addCase(getLoggedInAs.fulfilled, (state, action) => {
        state.loggedInAs = action.payload
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loggedInAs = action.payload
        state.loginError = undefined
      })
      .addCase(login.rejected, (state, action) => {
        state.loggedInAs = null
        state.loginError = action.error.message
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loggedInAs = action.payload
        state.registerErrors = []
      })
      .addCase(register.rejected, (state, action) => {
        const { payload } = action
        if (payload) {
          const { errors } = payload
          if (errors) {
            const registerErrors: string[] = []
            for (const [userProperty, propertyErrors] of Object.entries(errors)) {
              propertyErrors.forEach(propertyError => {
                registerErrors.push(`${userProperty} ${propertyError}`)
              })
            }
            state.registerErrors = registerErrors
            return
          }
        }
        state.registerErrors = [action.error.message ?? 'Something went wrong']
      })
  }
})

export const { setProfile } = profileSlice.actions

export const selectAllProfiles = (state: RootState) => state.profile.profiles
export const selectLoggedInAs = (state: RootState) => state.profile.loggedInAs

export const selectLoginError = (state: RootState) => state.profile.loginError
export const selectRegistrationErrors = (state: RootState) => state.profile.registerErrors

export const selectProfileByProfileId = createSelector(
  selectAllProfiles,
  (profiles) => {
    const profileByProfileId = new Map<number, Profile>()

    profiles.forEach((profile) => profileByProfileId.set(profile.id, profile))

    return profileByProfileId
  }
)

export default profileSlice.reducer
