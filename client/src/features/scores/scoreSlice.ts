import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {camelCaseKeys, fetchWrapper, snakeCaseKeys} from "../../api/FetchWrapper";
import {RootState} from "../../app/store";

export interface ScoreWeight {
  weightId: number;
  value: number;
}

export interface Score {
  name: string;
  profileId: number;
  rubricId: number;
  scoreWeights: ScoreWeight[];
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
export interface ScoreState {
  score: null | Score
  createScoreStatus: undefined | 'In Progress' | 'Created'
}

const initialState: ScoreState = {
  createScoreStatus: undefined,
  score: null,
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
  }
})

export const { clearCreateScoreStatus } = scoreSlice.actions

export const selectCreateScoreStatus = (state: RootState) => state.score.createScoreStatus

export default scoreSlice.reducer
