import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthCustomer {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  customer: AuthCustomer | null;
  setSession: (session: { accessToken: string; refreshToken: string; customer: AuthCustomer }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      customer: null,
      setSession: ({ accessToken, refreshToken, customer }) =>
        set({ accessToken, refreshToken, customer }),
      clearSession: () => set({ accessToken: null, refreshToken: null, customer: null }),
    }),
    { name: "auth-storage" },
  ),
);
