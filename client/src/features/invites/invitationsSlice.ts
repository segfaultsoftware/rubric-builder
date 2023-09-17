import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { camelCaseKeys, fetchWrapper, snakeCaseKeys } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'
import { type Profile } from '../profile/profileSlice'

export interface Invitation {
  id: number
  invitationToken: string
  email: string
  password?: string
  passwordConfirmation?: string
}

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
  async (invitation: Invitation) => {
    const json = await fetchWrapper.put('/invitation.json', {
      body: { user: snakeCaseKeys(invitation) },
      useJIT: false
    })
    return camelCaseKeys(json) as Profile
  }
)

export interface InvitationsState {
  acceptStatus: null | 'processing' | 'processed' | 'error'
  invitation: null | Invitation
}

const initialState: InvitationsState = {
  acceptStatus: null,
  invitation: null
}

export const invitationsSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    clearAcceptInvitationState: (state) => {
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
      })
      .addCase(acceptInvitation.fulfilled, (state) => {
        state.acceptStatus = 'processed'
      })
  }
})

export const { clearAcceptInvitationState } = invitationsSlice.actions

export const selectAcceptInvitationStatus = (state: RootState) => state.invitations.acceptStatus
export const selectInvitation = (state: RootState) => state.invitations.invitation

export default invitationsSlice.reducer
