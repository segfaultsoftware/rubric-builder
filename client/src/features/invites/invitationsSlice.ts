import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { camelCaseKeys, FetchNotOkError, fetchWrapper, snakeCaseKeys } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'
import { type Invitation } from '../../types/Invitation'
import { type Profile } from '../../types/Profile'

export const sendInvite = createAsyncThunk(
  'invitations/sendInvite',
  async (email: string) => {
    return await fetchWrapper.post('/api/v1/invites.json', {
      body: { email }
    })
  }
)

export const getInvitation = createAsyncThunk(
  'invitations/getInvitation',
  async (invitation: string) => {
    const json = await fetchWrapper.get(`/invitation/accept.json?invitation_token=${invitation}`, {
      useJIT: false
    })
    return camelCaseKeys(json) as Invitation
  }
)

export const acceptInvitation = createAsyncThunk(
  'invitations/acceptInvitation',
  async (invitation: Invitation, { rejectWithValue }) => {
    try {
      const json = await fetchWrapper.put('/invitation.json', {
        body: { user: snakeCaseKeys(invitation) },
        useJIT: false
      })
      return camelCaseKeys(json) as Profile
    } catch (err) {
      if (err instanceof FetchNotOkError) {
        return rejectWithValue(err.payload.message as Record<string, string[]>)
      }
      return rejectWithValue({
        errors: {
          AcceptInvitation: [`had unhandled error ${JSON.stringify(err)}`]
        }
      })
    }
  }
)

export interface InvitationsState {
  acceptErrors: string[]
  acceptStatus: null | 'processing' | 'processed' | 'error'
  invitation: null | Invitation
}

const initialState: InvitationsState = {
  acceptErrors: [],
  acceptStatus: null,
  invitation: null
}

export const invitationsSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    clearAcceptInvitationState: (state) => {
      state.acceptErrors = []
      state.acceptStatus = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInvitation.fulfilled, (state, action) => {
        state.invitation = action.payload
      })
      .addCase(getInvitation.rejected, (state, action) => {
        console.error('AcceptInvitation rejected', action)
      })
      .addCase(acceptInvitation.pending, (state) => {
        state.acceptStatus = 'processing'
        state.acceptErrors = []
      })
      .addCase(acceptInvitation.fulfilled, (state) => {
        state.acceptStatus = 'processed'
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        const fromRails = action.payload as Record<string, string[]>
        console.error('acceptInvitation.rejected action', fromRails)
        state.acceptErrors = fromRails.errors
      })
  }
})

export const { clearAcceptInvitationState } = invitationsSlice.actions

export const selectAcceptInvitationStatus = (state: RootState) => state.invitations.acceptStatus
export const selectAcceptInvitationErrors = (state: RootState) => state.invitations.acceptErrors
export const selectInvitation = (state: RootState) => state.invitations.invitation

export default invitationsSlice.reducer
