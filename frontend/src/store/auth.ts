import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, Role } from '@/types/domain';

interface AuthState {
  token: string | null;
  email: string | null;
  fullName: string | null;
  role: Role | null;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      fullName: null,
      role: null,
      setAuth: (auth) =>
        set({
          token: auth.token,
          email: auth.email,
          fullName: auth.fullName,
          role: auth.role,
        }),
      logout: () =>
        set({ token: null, email: null, fullName: null, role: null }),
    }),
    { name: 'athlete-auth' },
  ),
);
