import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { camelCaseKeys, fetchWrapper, snakeCaseKeys } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'
import { type Profile } from '../profile/profileSlice'

export interface Calibration {
  id?: number
  profileId: number
  weightId: number
  value: number
  error?: string | null | undefined
}

export interface Weight {
  id?: number
  name: string
  description: string
  profileWeights: Calibration[]
  _destroy?: boolean
  _new?: boolean
}
export interface Rubric {
  id?: number | null
  name: string
  authorId?: number | null
  weights: Weight[]
  members: Profile[]
}

export interface RubricState {
  rubrics: Rubric[]
  rubric: Rubric | null
  saveRubricState: 'initial' | 'pending' | 'saved'
  saveCalibrationsState: 'initial' | 'pending' | 'saved'
}

const initialState: RubricState = {
  rubrics: [],
  rubric: null,
  saveRubricState: 'initial',
  saveCalibrationsState: 'initial'
}

const prepareForServer = (rubric: Rubric) => {
  const railsReady = {
    ...snakeCaseKeys(rubric),
    weights_attributes: rubric.weights.map((weight) => {
      return snakeCaseKeys(weight)
    })
  }
  return railsReady
}

interface updateCalibrationsProperties {
  rubric: Rubric
  calibrations: Calibration[]
}

const callFetchRubric = async (id: number | null | undefined): Promise<Rubric> => {
  if (!id) {
    return Promise.reject(new Error('Attempting to query a rubric with no id'))
  }
  const response = await fetchWrapper.get(`/api/v1/rubrics/${id}.json`)
  return camelCaseKeys(response) as Rubric
}

export const updateCalibrationsForRubric = createAsyncThunk(
  'rubric/updateCalibrationsForRubric',
  async ({ rubric, calibrations }: updateCalibrationsProperties) => {
    await fetchWrapper.put(`/api/v1/rubrics/${rubric.id}/calibrations.json`, {
      body: {
        calibrations: calibrations.map((calibration) => snakeCaseKeys(calibration))
      }
    })
    return callFetchRubric(rubric.id)
  }
)

interface InviteMemberToRubricProperties {
  rubric: Rubric
  email: string
}

export const inviteMemberToRubric = createAsyncThunk(
  'rubric/inviteMemberToRubric',
  async ({ email, rubric }: InviteMemberToRubricProperties) => {
    await fetchWrapper.post(`/api/v1/rubrics/${rubric.id}/invites.json`, {
      body: { email }
    })
    return callFetchRubric(rubric.id)
  }
)

interface RemoveMemberFromRubricProperties {
  profile: Profile
  rubric: Rubric
}
export const removeMemberFromRubric = createAsyncThunk(
  'rubric/removeMemberFromRubric',
  async ({ profile, rubric }: RemoveMemberFromRubricProperties) => {
    await fetchWrapper.delete(`/api/v1/rubrics/${rubric.id}/profiles/${profile.id}`)
    return callFetchRubric(rubric.id)
  }
)

export const fetchRubrics = createAsyncThunk(
  'rubric/fetchRubrics',
  async () => {
    const rubrics = await fetchWrapper.get('/api/v1/rubrics.json')
    return rubrics.map((rubric: any) => camelCaseKeys(rubric)) as Rubric[]
  }
)

export const fetchRubric = createAsyncThunk(
  'rubric/fetchRubric',
  async (id: string) => {
    return callFetchRubric(parseInt(id))
  }
)

export const createRubric = createAsyncThunk(
  'rubric/createRubric',
  async (rubric: Rubric) => {
    const response = await fetchWrapper.post('/api/v1/rubrics.json', {
      body: prepareForServer(rubric)
    })
    return camelCaseKeys(response) as Rubric
  }
)

export const updateRubric = createAsyncThunk(
  'rubric/updateRubric',
  async (rubric: Rubric) => {
    const response = await fetchWrapper.put(`/api/v1/rubrics/${rubric.id}.json`, {
      body: prepareForServer(rubric)
    })
    return camelCaseKeys(response) as Rubric
  }
)

export const deleteRubric = createAsyncThunk(
  'rubric/deleteRubric',
  async (rubric: Rubric) => {
    await fetchWrapper.delete(`/api/v1/rubrics/${rubric.id}.json`)
    const rubrics = await fetchWrapper.get('/api/v1/rubrics.json')
    return rubrics.map((rubric: any) => camelCaseKeys(rubric)) as Rubric[]
  }
)

const rubricSlice = createSlice({
  name: 'rubric',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRubric.pending, (state) => {
        state.saveRubricState = 'initial'
        state.saveCalibrationsState = 'initial'
      })
      .addCase(fetchRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
      })
      .addCase(fetchRubrics.fulfilled, (state, action) => {
        state.rubrics = action.payload
      })
      .addCase(updateRubric.pending, (state) => {
        state.saveRubricState = 'pending'
      })
      .addCase(updateRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
        state.saveRubricState = 'saved'
      })
      .addCase(updateCalibrationsForRubric.pending, (state) => {
        state.saveCalibrationsState = 'pending'
      })
      .addCase(updateCalibrationsForRubric.fulfilled, (state) => {
        state.saveCalibrationsState = 'saved'
      })
      .addCase(deleteRubric.fulfilled, (state, action) => {
        state.rubrics = action.payload
      })
      .addCase(inviteMemberToRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
      })
      .addCase(removeMemberFromRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
      })
  }
})

export const selectRubrics = (state: RootState) => state.rubric.rubrics
export const selectRubric = (state: RootState) => state.rubric.rubric
export const selectSaveRubricState = (state: RootState) => state.rubric.saveRubricState
export const selectSaveCalibrationsState = (state: RootState) => state.rubric.saveCalibrationsState

export const selectWeightByWeightId = createSelector(
  selectRubric,
  (rubric) => {
    const weightById = new Map<number, Weight>()

    rubric?.weights.forEach((weight) => {
      if (weight.id) {
        weightById.set(weight.id, weight)
      }
    })

    return weightById
  }
)

export const selectCalibrationsByUserAndWeight = createSelector(
  selectRubric,
  (rubric) => {
    const calibrationsByUserAndWeight = new Map<number, Map<number, Calibration>>()
    if (!rubric) {
      return calibrationsByUserAndWeight
    }

    rubric.weights.forEach((weight) => {
      weight.profileWeights.forEach((profileWeight) => {
        const userWeights = calibrationsByUserAndWeight.get(profileWeight.profileId) ?? new Map<number, Calibration>()
        userWeights.set(profileWeight.weightId, profileWeight)
        calibrationsByUserAndWeight.set(profileWeight.profileId, userWeights)
      })
    })

    return calibrationsByUserAndWeight
  }
)

export const selectRubricProfilesById = createSelector(
  selectRubric,
  (rubric) => {
    const profileById = new Map<number, Profile>()
    if (rubric) {
      rubric.members.forEach((member) => {
        profileById.set(member.id, member)
      })
    }
    return profileById
  }
)

export default rubricSlice.reducer
