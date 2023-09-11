import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { camelCaseKeys, fetchWrapper, snakeCaseKeys } from '../../api/FetchWrapper'
import { type RootState } from '../../app/store'
import { selectCalibrationsByUserAndWeight } from '../rubric/rubricSlice'

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
    const readyForClient = scores.map((score: any) => camelCaseKeys(score)) as Score[]
    return readyForClient.sort((a, b) => a.name.localeCompare(b.name))
  }
)

export interface ScoreState {
  score: null | Score
  scores: Score[]
  createScoreStatus: undefined | 'In Progress' | 'Created'
}

const initialState: ScoreState = {
  createScoreStatus: undefined,
  score: null,
  scores: []
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

export const selectScoreCalculationsMap = createSelector(
  selectScoresForRubric,
  selectCalibrationsByUserAndWeight,
  (scores, calibrationsByUserAndWeight) => {
    const calculationByScoreNameUserWeight = new Map<string, Map<number, Map<number, number>>>()

    scores.forEach((score) => {
      const scoreByWeight = new Map<number, number>()
      score.scoreWeights.forEach((scoreWeight) => {
        scoreByWeight.set(scoreWeight.weightId, scoreWeight.value)
      })

      const calculationByUserWeight = calculationByScoreNameUserWeight.get(score.name) ?? new Map<number, Map<number, number>>()
      const calculationByWeight = calculationByUserWeight.get(score.profileId) ?? new Map<number, number>()

      let totalScore = 0
      const weightIds = Array.from(calibrationsByUserAndWeight.get(score.profileId)?.keys() ?? [])
      weightIds.forEach((weightId) => {
        const fromScore = scoreByWeight.get(weightId) ?? 0
        const fromCalibration = calibrationsByUserAndWeight.get(score.profileId)?.get(weightId)?.value ?? 0
        const scoreForWeight = fromScore * fromCalibration
        totalScore += scoreForWeight
        calculationByWeight.set(weightId, scoreForWeight)
      })
      calculationByWeight.set(-1, totalScore)
      calculationByUserWeight.set(score.profileId, calculationByWeight)
      calculationByScoreNameUserWeight.set(score.name, calculationByUserWeight)
    })

    return calculationByScoreNameUserWeight
  }
)

export default scoreSlice.reducer
