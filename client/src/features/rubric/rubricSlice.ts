import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {camelCaseKeys, fetchWrapper, snakeCaseKeys} from "../../api/FetchWrapper";
import {RootState} from "../../app/store";

export interface Weight {
  id?: number;
  name: string;
  description: string;
  _destroy?: boolean;
  _new?: boolean;
}
export interface Rubric {
  id?: number | null;
  name: string;
  authorId?: number | null;
  weights: Weight[],
}

export interface RubricState {
  rubrics: Rubric[];
  rubric: Rubric | null;
}

const initialState: RubricState = {
  rubrics: [],
  rubric: null,
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
    const rubric = await fetchWrapper.get(`/api/v1/rubrics/${id}.json`)
    return camelCaseKeys(rubric) as Rubric
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
      .addCase(fetchRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
      })
      .addCase(fetchRubrics.fulfilled, (state, action) => {
        state.rubrics = action.payload
      })
      .addCase(updateRubric.fulfilled, (state, action) => {
        state.rubric = action.payload
      })
      .addCase(deleteRubric.fulfilled, (state, action) => {
        state.rubrics = action.payload
      })
  }
})

export const selectRubrics = (state: RootState) => state.rubric.rubrics
export const selectRubric = (state: RootState) => state.rubric.rubric

export default rubricSlice.reducer
