import axios, { type AxiosInstance } from 'axios';

const base = (import.meta as any).env?.VITE_ONB_BASE_URL
  || (typeof window !== 'undefined' ? (window as any).__ONB_API_BASE_URL__ : undefined)
  || 'https://oms-server-ntlv.onrender.com';

export const onbClient: AxiosInstance = axios.create({
  baseURL: `${base.replace(/\/+$/g, '')}/onboarding`,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

onbClient.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('oms_access_token') : null;
    if (token) {
      config.headers = config.headers || {} as any;
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});


