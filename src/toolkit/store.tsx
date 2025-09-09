// toolkit/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';

export const store = configureStore({
  reducer: {
    authentication: authReducer,
  },
});

// ✅ Add this
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
