import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface StaffState {
  accessToken: string | null;
  refreshToken: string | null;
  user: StaffUser | null;
  setSession: (session: { accessToken: string; refreshToken: string; user: StaffUser }) => void;
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
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "staff-storage" },
  ),
);
