import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../../app/store'
import { fetchWrapper } from '../../api/FetchWrapper'
import { fetchRubric } from '../rubric/rubricSlice'
import { type ServerPush } from '../../types/ServerPush'

export interface BrowserState {
  pushSubscription: undefined | any // TODO
  vapidPublicKey: undefined | Uint8Array
}

const initialState: BrowserState = {
  pushSubscription: undefined,
  vapidPublicKey: undefined
}

export const dispatchFromServerPush = createAsyncThunk(
  'browser/dispatchFromServerPush',
  async (push: ServerPush, { dispatch }) => {
    if (push.action === 'update') {
      if (push.type === 'Rubric') {
        dispatch(fetchRubric(push.id.toString()))
      }
    }
  }
)

export const getBrowserSubscription = createAsyncThunk(
  'browser/getBrowserSubscription',
  async () => {
    return await fetchWrapper.get('/api/v1/browser_subscription.json')
  }
)

export const updateBrowserSubscription = createAsyncThunk(
  'browser/updateBrowserSubscription',
  async (subscription: PushSubscription) => {
    await fetchWrapper.put('/api/v1/browser_subscription.json', {
      body: { subscription }
    })
  }
)

export const browserSlice = createSlice({
  name: 'browser',
  initialState,
  reducers: {
    setSubscription: (state, action) => {
      state.pushSubscription = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBrowserSubscription.fulfilled, (state, action) => {
        state.vapidPublicKey = action.payload.vapid_public_key
      })
  }
})

export const selectBrowserSubscription = (state: RootState) => state.browser.pushSubscription
export const selectVapidPublicKey = (state: RootState) => state.browser.vapidPublicKey ? new Uint8Array(state.browser.vapidPublicKey) : null

export default browserSlice.reducer
