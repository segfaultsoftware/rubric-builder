import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { camelCaseKeys, fetchWrapper } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'
import { type CalibrationResultsResponse } from '../../types/CalibrationResult'

export interface CalibrationResultsState {
  calibrationResults: CalibrationResultsResponse | null
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: CalibrationResultsState = {
  calibrationResults: null,
  fetchStatus: 'idle'
}

interface FetchCalibrationResultsParams {
  rubricId: string
  profileId?: number
}

export const fetchCalibrationResults = createAsyncThunk(
  'calibrationResults/fetchCalibrationResults',
  async ({ rubricId, profileId }: FetchCalibrationResultsParams) => {
    const url = profileId
      ? `/api/v1/rubrics/${rubricId}/calibration_results.json?profile_id=${profileId}`
      : `/api/v1/rubrics/${rubricId}/calibration_results.json`
    const response = await fetchWrapper.get(url)
    return camelCaseKeys(response) as CalibrationResultsResponse
  }
)

const calibrationResultsSlice = createSlice({
  name: 'calibrationResults',
  initialState,
  reducers: {
    resetCalibrationResultsState: (state) => {
      state.calibrationResults = null
      state.fetchStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalibrationResults.pending, (state) => {
        state.fetchStatus = 'loading'
      })
      .addCase(fetchCalibrationResults.fulfilled, (state, action) => {
        state.calibrationResults = action.payload
        state.fetchStatus = 'succeeded'
      })
      .addCase(fetchCalibrationResults.rejected, (state) => {
        state.fetchStatus = 'failed'
      })
  }
})

export const selectCalibrationResults = (state: RootState) => state.calibrationResults.calibrationResults
export const selectCalibrationResultsFetchStatus = (state: RootState) => state.calibrationResults.fetchStatus

export const { resetCalibrationResultsState } = calibrationResultsSlice.actions

export default calibrationResultsSlice.reducer
