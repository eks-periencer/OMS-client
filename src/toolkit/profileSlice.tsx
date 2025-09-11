import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = 'http://localhost:3003';

// Async thunk to fetch user profile
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { getState }) => {
    const state = getState();
    const token = state.authentication.token; // Assuming token is stored in auth slice
    console.log(`token: ${token}`)

    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

// Define the profile state interface
const initialState = {
  user: {
    email: "",
    role: "",
  },
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = { email: "", role: "" };
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Extract only the email and role from the response
        state.user = {
          email: action.payload.user.email,
          role: action.payload.user.role
        };
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;