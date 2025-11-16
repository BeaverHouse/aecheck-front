import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AEAlterStatus,
  AEAwakenStatus,
  AECategories,
  AECharacterStyles,
  AELightShadow,
  AEManifestLevels,
  InvenStatus,
  ManifestStatus,
  WeaponTemperingStatus,
  GrastaWeaponTemperingFilter,
} from "../constants/enum";

interface FilterState {
  searchWord: string;
  invenStatusFilter: Array<InvenStatus>;
  manifestStatusFilter: Array<ManifestStatus>;
  weaponTemperingStatusFilter: Array<WeaponTemperingStatus>;
  grastaWeaponTemperingFilter: Array<GrastaWeaponTemperingFilter>;
  grastaStatusFilter: Array<number>;
  staralignStatusFilter: Array<number>;
  styleFilter: Array<AECharacterStyles>;
  manifestFilter: Array<AEManifestLevels>;
  categoryFilter: Array<AECategories>;
  alterFilter: Array<AEAlterStatus>;
  lightShadowFilter: Array<AELightShadow>;
  staralignFilter: Array<AEAwakenStatus>;
  essenTialPersonalityTags: Array<string>;
  choosePersonalityTags: Array<string>;
  dungeon: string | null;
  setSearch: (word: string) => void;
  setInvenStatusFilter: (inven: Array<InvenStatus>) => void;
  setManifestStatusFilter: (manifest: Array<ManifestStatus>) => void;
  setWeaponTemperingStatusFilter: (filter: Array<WeaponTemperingStatus>) => void;
  setGrastaWeaponTemperingFilter: (filter: Array<GrastaWeaponTemperingFilter>) => void;
  setGrastaStatusFilter: (grasta: Array<number>) => void;
  setStaralignStatusFilter: (staralign: Array<number>) => void;
  setStyleFilter: (style: Array<AECharacterStyles>) => void;
  setManifestFilter: (manifest: Array<AEManifestLevels>) => void;
  setCategoryFilter: (category: Array<AECategories>) => void;
  setAlterFilter: (alter: Array<AEAlterStatus>) => void;
  setLightShadowFilter: (lightShadow: Array<AELightShadow>) => void;
  setStaralignFilter: (staralign: Array<AEAwakenStatus>) => void;
  setPersonalities: (tags: Array<string>, essential: boolean) => void;
  removeFilter: () => void;
  setDungeon: (word: string | null) => void;
}

const initialState = {
  searchWord: "",
  invenStatusFilter: [InvenStatus.notOwned, InvenStatus.ccRequired],
  manifestStatusFilter: [
    ManifestStatus.notOwned,
    ManifestStatus.ccRequired,
    ManifestStatus.incompleted,
  ],
  weaponTemperingStatusFilter: [WeaponTemperingStatus.all],
  grastaWeaponTemperingFilter: [GrastaWeaponTemperingFilter.hasWeaponTempering, GrastaWeaponTemperingFilter.noWeaponTempering],
  grastaStatusFilter: [0, 1],
  staralignStatusFilter: [0, 1, 2],
  styleFilter: Object.values(AECharacterStyles),
  manifestFilter: Object.values(AEManifestLevels),
  categoryFilter: Object.values(AECategories),
  alterFilter: Object.values(AEAlterStatus),
  lightShadowFilter: Object.values(AELightShadow),
  staralignFilter: Object.values(AEAwakenStatus),
  essenTialPersonalityTags: [],
  choosePersonalityTags: [],
  dungeon: null,
};

const useFilterStore = create(
  persist<FilterState>(
    (set) => ({
      ...initialState,
      setSearch: (word) =>
        set((state) => ({
          ...state,
          searchWord: word,
        })),
      setInvenStatusFilter: (newFilter) =>
        set((state) => ({
          ...state,
          invenStatusFilter: newFilter,
        })),
      setManifestStatusFilter: (newFilter) =>
        set((state) => ({
          ...state,
          manifestStatusFilter: newFilter,
        })),
      setWeaponTemperingStatusFilter: (newFilter) =>
        set((state) => ({
          ...state,
          weaponTemperingStatusFilter: newFilter,
        })),
      setGrastaWeaponTemperingFilter: (newFilter) =>
        set((state) => ({
          ...state,
          grastaWeaponTemperingFilter: newFilter,
        })),
      setGrastaStatusFilter: (newFilter) =>
        set((state) => ({
          ...state,
          grastaStatusFilter: newFilter,
        })),
      setStaralignStatusFilter: (newFilter) =>
        set((state) => ({
          ...state,
          staralignStatusFilter: newFilter,
        })),
      setStyleFilter: (newFilter) =>
        set((state) => ({
          ...state,
          styleFilter: newFilter,
        })),
      setManifestFilter: (newFilter) =>
        set((state) => ({
          ...state,
          manifestFilter: newFilter,
        })),
      setCategoryFilter: (newFilter) =>
        set((state) => ({
          ...state,
          categoryFilter: newFilter,
        })),
      setAlterFilter: (newFilter) =>
        set((state) => ({
          ...state,
          alterFilter: newFilter,
        })),
      setLightShadowFilter: (newFilter) =>
        set((state) => ({
          ...state,
          lightShadowFilter: newFilter,
        })),
      setStaralignFilter: (newFilter) =>
        set((state) => ({
          ...state,
          staralignFilter: newFilter,
        })),
      setPersonalities: (tags, essential) => {
        if (essential)
          set((state) => ({
            ...state,
            essenTialPersonalityTags: tags,
          }));
        else
          set((state) => ({
            ...state,
            choosePersonalityTags: tags,
          }));
      },
      removeFilter: () => {
        set(
          (state) => ({
            ...state,
            ...initialState,
            invenStatusFilter: state.invenStatusFilter,
            manifestStatusFilter: state.manifestStatusFilter,
            weaponTemperingStatusFilter: state.weaponTemperingStatusFilter,
            grastaWeaponTemperingFilter: state.grastaWeaponTemperingFilter,
            grastaStatusFilter: state.grastaStatusFilter,
            staralignStatusFilter: state.staralignStatusFilter,
          }),
          true
        );
      },
      setDungeon: (word) =>
        set((state) => ({
          ...state,
          dungeon: word,
        })),
    }),
    {
      name: "AE_FILTER_V3_1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFilterStore;
