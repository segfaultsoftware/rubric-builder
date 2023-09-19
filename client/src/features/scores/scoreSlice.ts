import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { camelCaseKeys, fetchWrapper, snakeCaseKeys } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'

export interface ScoreWeight {
  id?: number
  weightId: number
  value: number
}

export interface Score {
  id?: number
  name: string
  profileId: number
  rubricId: number
  scoreWeights: ScoreWeight[]
}

const prepareScoreForServer = (score: Score) => {
  const railsReady = {
    ...snakeCaseKeys(score),
    score_weights_attributes: score.scoreWeights.map((scoreWeight) => snakeCaseKeys(scoreWeight))
  }
  return railsReady
}

export const createScore = createAsyncThunk(
  'score/createScore',
  async (score: Score) => {
    const response = await fetchWrapper.post(`/api/v1/rubrics/${score.rubricId}/scores.json`, {
      body: prepareScoreForServer(score)
    })
    return camelCaseKeys(response) as Score
  }
)

export const fetchScoresForRubricId = createAsyncThunk(
  'score/fetchScoresForRubricId',
  async (rubricId: string) => {
    const scores = await fetchWrapper.get(`/api/v1/rubrics/${rubricId}/scores.json`)
    return scores as Record<string, Record<string, Record<string, number>>>
  }
)

export interface ScoreState {
  score: null | Score
  scores: Record<string, Record<string, Record<string, number>>>
  createScoreStatus: undefined | 'In Progress' | 'Created'
}

const initialState: ScoreState = {
  createScoreStatus: undefined,
  score: null,
  scores: {}
}

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    clearCreateScoreStatus: (state) => {
      state.createScoreStatus = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createScore.pending, (state) => {
        state.createScoreStatus = 'In Progress'
      })
      .addCase(createScore.fulfilled, (state, action) => {
        state.score = action.payload
        state.createScoreStatus = 'Created'
      })
      .addCase(fetchScoresForRubricId.fulfilled, (state, action) => {
        state.scores = action.payload
      })
  }
})

export const { clearCreateScoreStatus } = scoreSlice.actions

export const selectCreateScoreStatus = (state: RootState) => state.score.createScoreStatus
export const selectScoresForRubric = (state: RootState) => state.score.scores

export const selectUniqueScoreNames = createSelector(
  selectScoresForRubric,
  (scores) => {
    return Array.from(Object.keys(scores))
  }
)

export default scoreSlice.reducer
