import { create } from 'zustand';
import type { MeResponse } from '../api/types';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: MeResponse | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: MeResponse) => void;
  clear: () => void;
  isAdmin: () => boolean;
};

const ACCESS_KEY = 'mayorista_access_token';
const REFRESH_KEY = 'mayorista_refresh_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem(ACCESS_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
  user: null,
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ accessToken, refreshToken });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  },
  isAdmin: () => get().user?.rol === 'ADMIN',
}));
