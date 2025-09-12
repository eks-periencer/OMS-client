import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = 'https://oms-server-ntlv.onrender.com';

// ---------------------------
// Types
// ---------------------------
interface LoginCredentials {
  method: 'email' | 'google';
  email?: string;
  password?: string;
  idToken?: string; // for Google login
  deviceInfo?: Record<string, any>;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  verificationToken: string | null;
  isEmailVerified: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

// ---------------------------
// Initial state
// ---------------------------
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  userId: null,
  verificationToken: null,
  isEmailVerified: false,
  accessToken: null,
  refreshToken: null,
};

// ---------------------------
// Async thunks
// ---------------------------

// Unified login (email or Google)
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data.data; // { user, accessToken, refreshToken }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || 'Login failed'
      );
    }
  }
);

// Registration
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || 'Registration failed'
      );
    }
  }
);

// Email verification
export const verifyEmail = createAsyncThunk(
  'auth/verify-email',
  async (token: string, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || 'Email verification failed'
      );
    }
  }
);

// Resend verification
export const resendVerification = createAsyncThunk(
  'auth/resend-verification',
  async (email: string, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || 'Failed to resend verification email'
      );
    }
  }
);

// ---------------------------
// Slice
// ---------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userId = null;
      state.verificationToken = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isEmailVerified = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.verificationToken = action.payload.verificationToken;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login (email or google)
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Email verification
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.isEmailVerified = true;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Resend verification
    builder
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationToken = action.payload.verificationToken;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// ---------------------------
// Exports
// ---------------------------
export const { logout, clearError, setAuthenticated } = authSlice.actions;
export const authReducer = authSlice.reducer;
