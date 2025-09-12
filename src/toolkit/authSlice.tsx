import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ---------------------------
// API Base URL
// ---------------------------
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
// Initial State
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
// Async Thunks
// ---------------------------

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data.data; // Expected: { user, accessToken, refreshToken, expiresIn }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error?.message || 'Login failed'
      );
    }
  }
);

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
  name: 'authentication',
  initialState,
  reducers: {
    logout: (state) => {
      Object.assign(state, initialState);
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.verificationToken = action.payload.verificationToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;

        const user = action.payload.user;

        // Debug log - remove in production
        console.log("🔥 LOGIN PAYLOAD:", action.payload);

        state.user = {
          id: user.id,
          email: user.email,
          password_hash: user.password_hash,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone ?? null,
          role_id: user.role_id,
          reporting_manager_id: user.reporting_manager_id,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_verified: user.email_verified,
          login_method: user.login_method,
          firebase_uid: user.firebase_uid,
          profile_picture_url: user.profile_picture_url,
          role_name: user.role_name ?? '', // Default to empty string
          role_permissions: user.role_permissions ?? [], // Default to empty array
        };

        state.userId = user.id;
        state.isEmailVerified = user.email_verified;

        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;

        const now = Math.floor(Date.now() / 1000);
        state.tokenIssuedAt = now;
        state.tokenExpiresAt = now + action.payload.expiresIn;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // VERIFY EMAIL
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.isEmailVerified = true;
        if (state.user) {
          state.user.email_verified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // RESEND VERIFICATION
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationToken = action.payload.verificationToken;
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
export const selectIsTokenExpired = (state: { authentication: AuthState }) => {
  const { tokenExpiresAt } = state.authentication;
  if (!tokenExpiresAt) return true;
  return Math.floor(Date.now() / 1000) >= tokenExpiresAt;
};

export const selectTimeUntilExpiry = (state: { authentication: AuthState }) => {
  const { tokenExpiresAt } = state.authentication;
  if (!tokenExpiresAt) return 0;
  return Math.max(0, tokenExpiresAt - Math.floor(Date.now() / 1000));
};

export const selectUserPermissions = (state: { authentication: AuthState }) =>
  state.authentication.user?.role_permissions || [];

export const selectUserRole = (state: { authentication: AuthState }) =>
  state.authentication.user?.role_name || '';

// ---------------------------
// Exports
// ---------------------------
export const { logout, clearError, setAuthenticated } = authSlice.actions;
export const authReducer = authSlice.reducer;
