import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMeApi } from '../features/auth/api/authApi';
import type { User } from '../features/auth/types';

interface AuthState {
  user: User | null;
  cargando: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      cargando: true,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      checkSession: async () => {
        set({ cargando: true });
        try {
          const user = await getMeApi();
          set({ user });
        } catch {
          set({ user: null });
        } finally {
          set({ cargando: false });
        }
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user }) }
  )
);