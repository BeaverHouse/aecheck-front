import { useTranslation } from "react-i18next";
import useFilterStore from "../store/useFilterStore";
import useConfigStore from "../store/useConfigStore";
import {
  AEAlterStatus,
  AEAwakenStatus,
  AECategories,
  AECharacterStyles,
  AELightShadow,
  AEManifestLevels,
} from "../constants/enum";
import { arrAllIncludes, arrOverlap } from "../util/arrayUtil";
import { matchesCharacterSearch } from "../util/func";

/** Whether a character passes the filter modal and the search field. */
export function useCharacterFilter() {
  const { t } = useTranslation();
  const showRealName = useConfigStore((state) => state.showRealName);
  const filter = useFilterStore();

  const matchesAttributes = (char: CharacterSummary) =>
    filter.styleFilter.includes(char.style as AECharacterStyles) &&
    filter.manifestFilter.includes(char.maxManifest as AEManifestLevels) &&
    filter.categoryFilter.includes(char.category as AECategories) &&
    filter.alterFilter.includes(char.isAlter as AEAlterStatus) &&
    filter.lightShadowFilter.includes(char.lightShadow as AELightShadow) &&
    filter.staralignFilter.includes(char.isAwaken as AEAwakenStatus);

  const matchesTagsAndSearch = (char: CharacterSummary) =>
    arrAllIncludes(char.personalityIds, filter.essenTialPersonalityTags) &&
    (filter.choosePersonalityTags.length <= 0 ||
      arrOverlap(char.personalityIds, filter.choosePersonalityTags)) &&
    (!filter.dungeon || char.dungeons.some((d) => d.id === filter.dungeon)) &&
    matchesCharacterSearch(char, t, filter.searchWord, showRealName);

  return (char: CharacterSummary) =>
    matchesAttributes(char) && matchesTagsAndSearch(char);
}
