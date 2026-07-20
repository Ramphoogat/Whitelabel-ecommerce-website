import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface UiState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

/** Real persisted user preference (localStorage), not a media query. */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeMode: "light",
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    { name: "ui-storage" },
  ),
);
