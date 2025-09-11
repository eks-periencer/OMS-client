import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = 'http://localhost:3003';

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

interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role_id: string;
  reporting_manager_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  login_method: string;
  firebase_uid: string | null;
  profile_picture_url: string | null;
  role_name: string;
  role_permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  verificationToken: string | null;
  isEmailVerified: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  tokenIssuedAt: number | null;
  tokenExpiresAt: number | null;
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
  expiresIn: null,
  tokenIssuedAt: null,
  tokenExpiresAt: null,
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
      return response.data.data; // { user, accessToken, refreshToken, expiresIn }
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
      state.expiresIn = null;
      state.tokenIssuedAt = null;
      state.tokenExpiresAt = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    loading: (state, action) =>{

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
        
        // Store all user data
        state.user = action.payload.user;
        state.userId = action.payload.user.id;
        state.isEmailVerified = action.payload.user.email_verified;
        
        // Store token data
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        
        // Calculate and store token timestamps
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        state.tokenIssuedAt = now;
        state.tokenExpiresAt = now + action.payload.expiresIn;
        
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
        // Update user object if it exists
        if (state.user) {
          state.user.email_verified = true;
        }
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
// Selectors
// ---------------------------
export const selectIsTokenExpired = (state: { auth: AuthState }) => {
  if (!state.auth.tokenExpiresAt) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= state.auth.tokenExpiresAt;
};

export const selectTimeUntilExpiry = (state: { auth: AuthState }) => {
  if (!state.auth.tokenExpiresAt) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, state.auth.tokenExpiresAt - now);
};

export const selectUserPermissions = (state: { auth: AuthState }) => {
  return state.auth.user?.role_permissions || [];
};

export const selectUserRole = (state: { auth: AuthState }) => {
  return state.auth.user?.role_name;
};

// ---------------------------
// Exports
// ---------------------------
export const { logout, clearError, setAuthenticated, loading } = authSlice.actions;
export const authReducer = authSlice.reducer;