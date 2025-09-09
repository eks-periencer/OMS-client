import { configureStore } from '@reduxjs/toolkit';
import testReducer from './testSlice';

const store = configureStore({
  reducer: {
    digit: testReducer,
  },
});

export default store;