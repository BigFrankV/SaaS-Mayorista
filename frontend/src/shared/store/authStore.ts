import { create } from 'zustand';
import { authApi } from '../api/authApi';
import type { MeResponse, UserRol } from '../api/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  accessToken: string | null;
  user: MeResponse | null;
  status: AuthStatus;
  setTokens: (accessToken: string) => void;
  setUser: (user: MeResponse) => void;
  clear: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (...roles: UserRol[]) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  status: 'loading',

  // The access token lives in memory only. It is re-obtained on page load via
  // hydrate() -> POST /auth/refresh, which authenticates with the httpOnly
  // refresh cookie. Nothing token-related is persisted in localStorage.
  setTokens: (accessToken) => set({ accessToken, status: 'authenticated' }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null, status: 'unauthenticated' }),

  login: async (email, password) => {
    const tokenData = await authApi.login(email, password);
    set({ accessToken: tokenData.accessToken, status: 'authenticated' });
    try {
      const me = await authApi.me();
      set({ user: me });
    } catch {
      // Profile is best-effort; the session is already established via the access token.
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // The cookie may already be gone (expired/revoked); local state must still clear.
    }
    set({ accessToken: null, user: null, status: 'unauthenticated' });
  },

  hydrate: async () => {
    try {
      const tokenData = await authApi.refresh();
      set({ accessToken: tokenData.accessToken, status: 'authenticated' });
      try {
        const me = await authApi.me();
        set({ user: me });
      } catch {
        // /me is retried by ProtectedRoute; the session itself is valid.
      }
    } catch {
      set({ accessToken: null, user: null, status: 'unauthenticated' });
    }
  },

  isAdmin: () => get().user?.rol === 'ADMIN',
  hasRole: (...roles) => {
    const user = get().user;
    if (!user) return false;
    return roles.includes(user.rol);
  },
}));
