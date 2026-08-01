import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { TokenResponse } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const httpClient = axios.create({
  baseURL,
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

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().clear();
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
      const response = await axios.post<TokenResponse>(`${baseURL}/auth/refresh`, { refreshToken });
      useAuthStore.getState().setTokens(response.data.accessToken, response.data.refreshToken);
      queue.forEach((cb) => cb(response.data.accessToken));
      queue = [];
      originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return httpClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clear();
      queue.forEach((cb) => cb(null));
      queue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
