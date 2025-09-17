import axios, { AxiosInstance } from 'axios';

// Resolve API base URL from Vite env with sane defaults
const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL
  || (typeof window !== 'undefined' ? window.__OMS_API_BASE_URL__ : undefined)
  || 'http://localhost:3003';

// Create a shared axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/g, ''),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Allow consumers to set/update bearer token
export function setAuthToken(token?: string): void {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// Attach Authorization from localStorage on each request (keeps it fresh)
apiClient.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('oms_access_token') : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Helper to normalize API responses shaped as { success, data }
export function unwrap<T>(response: any): T {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return response as T;
}


export default apiClient;
