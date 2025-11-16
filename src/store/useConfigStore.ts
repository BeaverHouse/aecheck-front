import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AnalysisMenuOptions,
  CheckMenuOptions,
  CheckTabOptions,
  DisplayMode,
  PopupOnCheckOptions,
  ThemeOptions,
} from "../constants/enum";

interface ConfigState {
  popupOnCheck: PopupOnCheckOptions;
  theme: ThemeOptions;
  displayMode: DisplayMode;
  lastCheckMenu: CheckMenuOptions;
  lastCheckTab: CheckTabOptions;
  lastSearchMenu: CheckMenuOptions;
  lastAnalysisMenu: AnalysisMenuOptions;
  setPopupOnCheck: (popup: PopupOnCheckOptions) => void;
  toggleTheme: (theme: ThemeOptions) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  updateLastCheckMenu: (option: CheckMenuOptions) => void;
  updateLastCheckTab: (option: CheckTabOptions) => void;
  updateLastSearchMenu: (option: CheckMenuOptions) => void;
  updateLastAnalysisMenu: (option: AnalysisMenuOptions) => void;
}

const useConfigStore = create(
  persist<ConfigState>(
    (set) => ({
      popupOnCheck: PopupOnCheckOptions.fourOnly,
      theme: ThemeOptions.light,
      displayMode: DisplayMode.pagination,
      lastCheckMenu: CheckMenuOptions.characters,
      lastCheckTab: CheckTabOptions.inven,
      lastSearchMenu: CheckMenuOptions.characters,
      lastAnalysisMenu: AnalysisMenuOptions.stardream,
      setPopupOnCheck: (popup) =>  set((state) => ({
        ...state,
        popupOnCheck: popup,
      })),
      toggleTheme: (theme) =>
        set((state) => ({
          ...state,
          theme: theme,
        })),
      setDisplayMode: (mode) =>
        set((state) => ({
          ...state,
          displayMode: mode,
        })),
      updateLastCheckMenu: (option) =>
        set((state) => ({
          ...state,
          lastCheckMenu: option,
        })),
      updateLastCheckTab: (option) =>
        set((state) => ({
          ...state,
          lastCheckTab: option,
        })),
      updateLastSearchMenu: (option) =>
        set((state) => ({
          ...state,
          lastSearchMenu: option,
        })),
      updateLastAnalysisMenu: (option) =>
        set((state) => ({
          ...state,
          lastAnalysisMenu: option,
        })),
    }),
    {
      name: "AE_CONFIG_V3_1",
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown) => {
        // Add displayMode to existing configs if it doesn't exist
        if (persistedState && typeof persistedState === 'object' && 'displayMode' in persistedState === false) {
          (persistedState as ConfigState).displayMode = DisplayMode.pagination;
        }
        return persistedState as ConfigState;
      },
    }
  )
);

export default useConfigStore;
