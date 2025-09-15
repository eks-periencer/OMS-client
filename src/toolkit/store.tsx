// toolkit/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';
import { userManagementReducer } from './userManagementSlice';

export const store = configureStore({
  reducer: {
    authentication: authReducer,
    userManagement: userManagementReducer
  },
});

// ✅ Add this
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
