import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

const API_URL = import.meta.env.VITE_API_URL || 'https://oms-server-ntlv.onrender.com'

// Debug logging
console.log('🔧 UserManagement API_URL:', API_URL)
console.log('🔧 VITE_API_URL env var:', import.meta.env.VITE_API_URL)
console.log('🔧 UPDATED CODE IS RUNNING - DEBUG LOG ADDED AT:', new Date().toISOString())

// Types
interface Role {
  id: string
  name: string
  permissions: string[]
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role_name: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role_name?: string
  isActive?: boolean
}

interface UserManagementState {
  users: User[]
  selectedUser: User | null
  stats: {
    total: number
    active: number
    inactive: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: UserManagementState = {
  users: [],
  selectedUser: null,
  stats: null,
  loading: false,
  error: null,
}

// 🔐 Auth header from Redux token
const getAuthHeader = (getState: () => RootState) => {
  const token = getState().authentication.accessToken
  console.log('🔧 Getting auth header, token available:', token ? 'YES' : 'NO')
  console.log('🔧 Token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NO TOKEN')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Thunks

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/user-management`, getAuthHeader(thunkAPI.getState as () => RootState))
      // Transform backend response to match frontend expectations
      const users = response.data.data?.map((user: any) => ({
        id: user.id || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: {
          id: user.role_id || '',
          name: user.role_name || '',
          permissions: user.permissions || []
        },
        isActive: Boolean(user.is_active),
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: user.updated_at || new Date().toISOString()
      })) || []
      return users
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to fetch users'
        : 'Failed to fetch users';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const fetchUserStats = createAsyncThunk(
  'userManagement/fetchUserStats',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/user-management/stats`, getAuthHeader(thunkAPI.getState as () => RootState))
      // Transform backend response to match frontend expectations
      const stats = response.data.data
      return {
        total: stats.totalUsers,
        active: stats.activeUsers,
        inactive: stats.inactiveUsers
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to fetch stats'
        : 'Failed to fetch stats';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData: CreateUserData, thunkAPI) => {
    try {
      // Transform frontend data to match backend expectations
      const backendData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        roleName: userData.role_name
      }
      const fullUrl = `${API_URL}/user-management`
      console.log('🔧 Creating user with URL:', fullUrl)
      console.log('🔧 Backend data:', backendData)
      console.log('🔧 Auth header:', getAuthHeader(thunkAPI.getState as () => RootState))
      
      const response = await axios.post(fullUrl, backendData, getAuthHeader(thunkAPI.getState as () => RootState))
      
      // The backend returns {success: true, userId: "..."} 
      // We'll just return the success response and let the UI refresh the users list
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to create user'
        : 'Failed to create user';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ id, data }: { id: string; data: UpdateUserData }, thunkAPI) => {
    try {
      // Transform frontend data to match backend expectations
      const backendData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role_name: data.role_name
      }
      const response = await axios.put(`${API_URL}/user-management/${id}`, backendData, getAuthHeader(thunkAPI.getState as () => RootState))
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to update user'
        : 'Failed to update user';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const deactivateUser = createAsyncThunk(
  'userManagement/deactivateUser',
  async (id: string, thunkAPI) => {
    try {
      await axios.post(`${API_URL}/user-management/${id}/deactivate`, null, getAuthHeader(thunkAPI.getState as () => RootState))
      return id
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to deactivate user'
        : 'Failed to deactivate user';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const reactivateUser = createAsyncThunk(
  'userManagement/reactivateUser',
  async (id: string, thunkAPI) => {
    try {
      await axios.post(`${API_URL}/user-management/${id}/reactivate`, null, getAuthHeader(thunkAPI.getState as () => RootState))
      return id
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to reactivate user'
        : 'Failed to reactivate user';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/user-management/${id}`, getAuthHeader(thunkAPI.getState as () => RootState))
      return id
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to delete user'
        : 'Failed to delete user';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const resetUserPassword = createAsyncThunk(
  'userManagement/resetUserPassword',
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/user-management/${id}/reset-password`, null, getAuthHeader(thunkAPI.getState as () => RootState))
      return response.data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Failed to reset password'
        : 'Failed to reset password';
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

// Slice

export const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<User>) {
      state.selectedUser = action.payload
    },
    clearSelectedUser(state) {
      state.selectedUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.loading = false
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      .addCase(createUser.fulfilled, (state, action) => {
        // Don't add to users array since backend only returns {success: true, userId: "..."}
        // The UI will refresh the users list after successful creation
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload
        state.users = state.users.map((u) => (u.id === updated.id ? updated : u))
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload)
        if (user) user.isActive = false
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload)
        if (user) user.isActive = true
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload)
      })
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload
        state.loading = false
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
  },
})

export const { setSelectedUser, clearSelectedUser } = userManagementSlice.actions
export const userManagementReducer = userManagementSlice.reducer
