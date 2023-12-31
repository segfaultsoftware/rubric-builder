import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../../app/store'
import { camelCaseKeys, FetchNotOkError, fetchWrapper } from '../../api/FetchWrapper'
import { type Profile, type ProfileAuthentication } from '../../types/Profile'

export interface ProfileState {
  loggedInAs: Profile | null
  loginError: string | undefined
  registerErrors: string[]
}

const initialState: ProfileState = {
  loggedInAs: null,
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
        return rejectWithValue(err.payload.message as RegistrationError)
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

export const logout = createAsyncThunk(
  'profile/logout',
  async () => {
    return await fetchWrapper.delete('/logout.json')
  }
)

export const getLoggedInAs = createAsyncThunk(
  'profile/getLoggedInAs',
  async () => {
    const profile = await fetchWrapper.get('/current_user.json')
    return camelCaseKeys(profile) as Profile
  }
)

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearAuthenticationErrors: (state) => {
      state.registerErrors = []
      state.loginError = undefined
    },
    setRegistrationError: (state, action) => {
      state.registerErrors = [action.payload]
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(logout.fulfilled, (state) => {
        state.loggedInAs = null
      })
      .addCase(logout.rejected, (state) => {
        state.loggedInAs = null
      })
      .addCase(register.rejected, (state, action) => {
        const { payload } = action
        if (payload) {
          const { errors } = payload
          if (errors) {
            const registerErrors: string[] = []
            for (const [userProperty, propertyErrors] of Object.entries(errors)) {
              propertyErrors.forEach(propertyError => {
                const firstLetter = userProperty.charAt(0).toUpperCase()
                const remainingLetters = userProperty.slice(1)
                const capitalizedWord = firstLetter + remainingLetters
                registerErrors.push(`${capitalizedWord} ${propertyError}`)
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

export const { clearAuthenticationErrors, setRegistrationError } = profileSlice.actions

export const selectLoggedInAs = (state: RootState) => state.profile.loggedInAs

export const selectLoginError = (state: RootState) => state.profile.loginError
export const selectRegistrationErrors = (state: RootState) => state.profile.registerErrors

export default profileSlice.reducer
