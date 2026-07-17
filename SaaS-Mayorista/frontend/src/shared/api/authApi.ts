import { httpClient } from './httpClient';
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
  logout: async (refreshToken: string) => {
    await httpClient.post('/auth/logout', { refreshToken });
  }
};
