import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  allowedSections: string[] | null;
}

interface StaffState {
  accessToken: string | null;
  refreshToken: string | null;
  user: StaffUser | null;
  setSession: (session: { accessToken: string; refreshToken: string; user: StaffUser }) => void;
  updateUser: (patch: Partial<StaffUser>) => void;
  clearSession: () => void;
}

/** Staff (owner/admin/staff) session — separate store from the customer auth-store so the two can never mix. */
export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "staff-storage" },
  ),
);
