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
  deviceInfo?: Record<string, unknown>;
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
// Token Persistence Utilities
// ---------------------------
const TOKEN_KEY = 'oms_access_token';
const REFRESH_TOKEN_KEY = 'oms_refresh_token';
const USER_KEY = 'oms_user_data';
const TOKEN_EXPIRY_KEY = 'oms_token_expiry';

const saveTokensToStorage = (accessToken: string, refreshToken: string, user: User, expiresIn: number) => {
  const tokenExpiry = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiry.toString());
};

const loadTokensFromStorage = () => {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userData = localStorage.getItem(USER_KEY);
  const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (accessToken && refreshToken && userData && tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry);
    const now = Date.now();
    
    // Check if token is still valid (with 5 minute buffer)
    if (now < expiryTime - 300000) {
      return {
        accessToken,
        refreshToken,
        user: JSON.parse(userData),
        tokenExpiry: expiryTime
      };
    } else {
      // Token expired, clear storage
      clearTokensFromStorage();
    }
  }
  
  return null;
};

const clearTokensFromStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

// ---------------------------
// Initial State
// ---------------------------
const getInitialState = (): AuthState => {
  const storedData = loadTokensFromStorage();
  
  if (storedData) {
    const now = Math.floor(Date.now() / 1000);
    const tokenExpiresAt = Math.floor(storedData.tokenExpiry / 1000);
    
    return {
      isAuthenticated: true,
      user: storedData.user,
      loading: false,
      error: null,
      userId: storedData.user.id,
      verificationToken: null,
      isEmailVerified: storedData.user.email_verified,
      accessToken: storedData.accessToken,
      refreshToken: storedData.refreshToken,
      expiresIn: tokenExpiresAt - now,
      tokenIssuedAt: now - (tokenExpiresAt - now),
      tokenExpiresAt: tokenExpiresAt,
    };
  }
  
  return {
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
};

const initialState: AuthState = getInitialState();

// ---------------------------
// Async Thunks
// ---------------------------

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data.data; // Expected: { user, accessToken, refreshToken, expiresIn }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Login failed'
        : 'Login failed';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Registration failed'
        : 'Registration failed';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verify-email',
  async (token: string, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Email verification failed'
        : 'Email verification failed';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resend-verification',
  async (email: string, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to resend verification email'
        : 'Failed to resend verification email';
      return thunkAPI.rejectWithValue(errorMessage);
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
      // Clear localStorage
      clearTokensFromStorage();
      // Reset state to initial values
      Object.assign(state, {
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
      });
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

        const userData = {
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

        state.user = userData;
        state.userId = user.id;
        state.isEmailVerified = user.email_verified;

        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;

        const now = Math.floor(Date.now() / 1000);
        state.tokenIssuedAt = now;
        state.tokenExpiresAt = now + action.payload.expiresIn;

        // Save tokens to localStorage for persistence
        saveTokensToStorage(
          action.payload.accessToken,
          action.payload.refreshToken,
          userData,
          action.payload.expiresIn
        );
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
