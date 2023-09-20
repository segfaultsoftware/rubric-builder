import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { camelCaseKeys, fetchWrapper, snakeCaseKeys } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'
import { type Profile } from '../profile/profileSlice'
import { flatten } from 'lodash'

export interface Calibration {
  fromWeightId: number
  toWeightId: number
  rating: number
}

export interface ProfileWeight {
  id?: number
  profileId: number
  weightId: number
  value: number
  error?: string | null | undefined
}

export interface Weight {
  id?: number
  name: string
  profileWeights: ProfileWeight[]
  _destroy?: boolean
  _new?: boolean
}
export interface Rubric {
  id?: number | null
  name: string
  authorId?: number | null
  weights: Weight[]
  members: Profile[]
  pairings?: number[][]
}

export interface RubricState {
  rubrics: Rubric[]
  rubric: Rubric | null
  saveRubricState: 'initial' | 'pending' | 'saved'
  saveCalibrationsState: 'initial' | 'pending' | 'saved'
  inviteMemberState: 'initial' | 'pending' | 'saved' | 'error'
}

const initialState: RubricState = {
  rubrics: [],
  rubric: null,
  saveRubricState: 'initial',
  saveCalibrationsState: 'initial',
  inviteMemberState: 'initial'
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
  calibration: Calibration
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
  async ({ rubric, calibration }: updateCalibrationsProperties) => {
    await fetchWrapper.put(`/api/v1/rubrics/${rubric.id}/calibrations.json`, {
      body: snakeCaseKeys(calibration)
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
  reducers: {
    resetRubricState: (state) => {
      state.rubric = null
      state.rubrics = []
      state.saveRubricState = 'initial'
      state.saveCalibrationsState = 'initial'
      state.inviteMemberState = 'initial'
    },
    clearInviteMemberStatus: (state) => {
      state.inviteMemberState = 'initial'
    },
    clearSaveCalibrationState: (state) => {
      state.saveCalibrationsState = 'initial'
    }
  },
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
      .addCase(updateCalibrationsForRubric.fulfilled, (state, action) => {
        state.saveCalibrationsState = 'saved'
        state.rubric = action.payload
      })
      .addCase(deleteRubric.fulfilled, (state, action) => {
        state.rubrics = action.payload
      })
      .addCase(inviteMemberToRubric.pending, (state, action) => {
        state.inviteMemberState = 'pending'
      })
      .addCase(inviteMemberToRubric.rejected, (state, action) => {
        state.inviteMemberState = 'error'
        console.error('Failed to invite member to rubric', action.payload)
      })
      .addCase(inviteMemberToRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
        state.inviteMemberState = 'saved'
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
export const selectInviteMemberToRubricState = (state: RootState) => state.rubric.inviteMemberState

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

export const selectProfileWeightByWeightId = createSelector(
  selectRubric,
  (rubric) => {
    const profileWeightByWeightId = new Map<number, ProfileWeight>()

    if (rubric) {
      const profileWeights = flatten(rubric.weights.map((weight) => weight.profileWeights))
      profileWeights.forEach((profileWeight) => {
        profileWeightByWeightId.set(profileWeight.weightId, profileWeight)
      })
    }

    return profileWeightByWeightId
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

export const { clearInviteMemberStatus, clearSaveCalibrationState, resetRubricState } = rubricSlice.actions

export default rubricSlice.reducer
