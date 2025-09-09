import { createSlice } from "@reduxjs/toolkit";

const testSlice = createSlice({
  name: "test",
  initialState: {
    digit: 0,
  },
  reducers: {
    increment: (state) => {
    //   state.value += 1;
    },
    decrement: (state) => {
    //   state.value -= 1;
    },
  },
});

export const { increment, decrement } = testSlice.actions;
export default testSlice.reducer;
