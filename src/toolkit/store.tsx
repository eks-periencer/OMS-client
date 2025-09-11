// toolkit/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';
import { profileReducer } from './profileSlice';

export const store = configureStore({
  reducer: {
    authentication: authReducer,
    profile: profileReducer
  },
});

// ✅ Add this
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
