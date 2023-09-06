import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import profileReducer from '../features/profile/profileSlice';
import rubricReducer from '../features/rubric/rubricSlice';
import scoreReducer from '../features/scores/scoreSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    profile: profileReducer,
    rubric: rubricReducer,
    score: scoreReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
