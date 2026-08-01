import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { TokenResponse } from './types';

export const baseURL = import.meta.env.VITE_API_BASE_URL;

export const httpClient = axios.create({
  baseURL,
  // Required so the httpOnly refresh cookie travels with every request
  // (used by /auth/refresh and /auth/logout).
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Parse error response body into a user-friendly shape
function parseErrorBody(error: unknown): { message: string; status?: number } {
  const axiosError = error as any;
  const data = axiosError?.response?.data;
  if (data && typeof data === 'object') {
    // New standard format: { status, error, message, timestamp }
    if ('status' in data && 'message' in data) {
      console.warn(`API Error [${data.status}]: ${data.message}`);
      return { message: data.message, status: data.status };
    }
    // Legacy format: { message }
    if ('message' in data) {
      console.warn(`API Error: ${data.message}`);
      return { message: data.message };
    }
  }
  return { message: axiosError?.message ?? 'Unknown error' };
}

function redirectToLogin() {
  if (typeof window === 'undefined' || window.location.pathname === '/login') {
    return;
  }
  window.location.assign('/login');
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Parse and log every error, not just 401s
    const parsed = parseErrorBody(error);
    console.warn(`Request failed [${parsed.status ?? 'N/A'}]: ${parsed.message}`);

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      useAuthStore.getState().clear();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(httpClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Raw axios on purpose: the refresh endpoint authenticates via the httpOnly
      // cookie, and using httpClient here would recurse into this interceptor.
      const response = await axios.post<TokenResponse>(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      const newAccessToken = response.data.accessToken;
      useAuthStore.getState().setTokens(newAccessToken);
      queue.forEach((cb) => cb(newAccessToken));
      queue = [];
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clear();
      queue.forEach((cb) => cb(null));
      queue = [];
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
