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
  colorBlindMode: boolean;
  showTierBadge: boolean;
  showRealName: boolean;
  hasSeenTierIntro: boolean;
  lastCheckMenu: CheckMenuOptions;
  lastCheckTab: CheckTabOptions;
  lastSearchMenu: CheckMenuOptions;
  lastAnalysisMenu: AnalysisMenuOptions;
  setPopupOnCheck: (popup: PopupOnCheckOptions) => void;
  toggleTheme: (theme: ThemeOptions) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setColorBlindMode: (enabled: boolean) => void;
  setShowTierBadge: (enabled: boolean) => void;
  setShowRealName: (enabled: boolean) => void;
  setHasSeenTierIntro: (seen: boolean) => void;
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
      colorBlindMode: false,
      showTierBadge: false,
      showRealName: false,
      hasSeenTierIntro: false,
      lastCheckMenu: CheckMenuOptions.characters,
      lastCheckTab: CheckTabOptions.inven,
      lastSearchMenu: CheckMenuOptions.characters,
      lastAnalysisMenu: AnalysisMenuOptions.stardream,
      setPopupOnCheck: (popup) => set({ popupOnCheck: popup }),
      toggleTheme: (theme) => set({ theme }),
      setDisplayMode: (mode) => set({ displayMode: mode }),
      setColorBlindMode: (enabled) => set({ colorBlindMode: enabled }),
      setShowTierBadge: (enabled) => set({ showTierBadge: enabled }),
      setShowRealName: (enabled) => set({ showRealName: enabled }),
      setHasSeenTierIntro: (seen) => set({ hasSeenTierIntro: seen }),
      updateLastCheckMenu: (option) => set({ lastCheckMenu: option }),
      updateLastCheckTab: (option) => set({ lastCheckTab: option }),
      updateLastSearchMenu: (option) => set({ lastSearchMenu: option }),
      updateLastAnalysisMenu: (option) => set({ lastAnalysisMenu: option }),
    }),
    {
      name: "AE_CONFIG_V3_1",
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown) => {
        if (persistedState && typeof persistedState === 'object') {
          // Add displayMode to existing configs if it doesn't exist
          if ('displayMode' in persistedState === false) {
            (persistedState as ConfigState).displayMode = DisplayMode.pagination;
          }
          // Add colorBlindMode to existing configs if it doesn't exist
          if ('colorBlindMode' in persistedState === false) {
            (persistedState as ConfigState).colorBlindMode = false;
          }
          // Add showTierBadge to existing configs if it doesn't exist
          if ('showTierBadge' in persistedState === false) {
            (persistedState as ConfigState).showTierBadge = false;
          }
          // Add showRealName to existing configs if it doesn't exist
          if ('showRealName' in persistedState === false) {
            (persistedState as ConfigState).showRealName = false;
          }
          // Add hasSeenTierIntro to existing configs if it doesn't exist
          if ('hasSeenTierIntro' in persistedState === false) {
            (persistedState as ConfigState).hasSeenTierIntro = false;
          }
        }
        return persistedState as ConfigState;
      },
    }
  )
);

export default useConfigStore;
