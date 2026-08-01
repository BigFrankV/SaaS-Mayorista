import axios from 'axios';
import { baseURL, httpClient } from './httpClient';
import type { TokenResponse } from './types';

export type BootstrapPayload = {
  nombreEmpresa: string;
  rutEmpresa: string;
  giroEmpresa: string;
  direccionEmpresa?: string;
  nombreAdmin: string;
  emailAdmin: string;
  passwordAdmin: string;
};

export const authApi = {
  bootstrap: async (payload: BootstrapPayload): Promise<TokenResponse> => {
    const { data } = await httpClient.post<TokenResponse>('/auth/bootstrap', payload);
    return data;
  },
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await httpClient.post<TokenResponse>('/auth/login', { email, password });
    return data;
  },
  me: async () => {
    const { data } = await httpClient.get('/auth/me');
    return data;
  },
  logout: async () => {
    // The refresh token rides in the httpOnly cookie; the backend also reads the
    // access token from the Authorization header added by the httpClient interceptor.
    await httpClient.post('/auth/logout');
  },
  refresh: async (): Promise<TokenResponse> => {
    // Raw axios on purpose: this endpoint authenticates via the httpOnly cookie,
    // so no Authorization header is needed and the response interceptor must not
    // interpret its result.
    const { data } = await axios.post<TokenResponse>(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
    return data;
  }
};
