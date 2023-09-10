import { configureStore, type ThunkAction, type Action, combineReducers, type PreloadedState } from '@reduxjs/toolkit'
import profileReducer from '../features/profile/profileSlice'
import rubricReducer from '../features/rubric/rubricSlice'
import scoreReducer from '../features/scores/scoreSlice'

const rootReducer = combineReducers({
  profile: profileReducer,
  rubric: rubricReducer,
  score: scoreReducer
})

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
