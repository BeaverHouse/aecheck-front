import { useQuery } from "@tanstack/react-query";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import {
  AEAlterStatus,
  AEAwakenStatus,
  AECategories,
  AECharacterStyles,
  AELightShadow,
  AEManifestLevels,
  DisplayMode,
  ModalType,
  CheckMenuOptions,
} from "../../../constants/enum";
import { createCharacterSorter, matchesCharacterSearch } from "../../../util/func";
import { useTranslation } from "react-i18next";
import GlobalFilter from "../../molecules/GlobalFilter";
import useFilterStore from "../../../store/useFilterStore";
import useConfigStore from "../../../store/useConfigStore";
import Loading from "../../atoms/Loading";
import { arrAllIncludes, arrOverlap } from "../../../util/arrayUtil";
import { fetchAPI } from "../../../util/api";
import { usePagination, getItemsPerPage } from "../../../hooks/usePagination";
import ListPagination from "@/components/molecules/ListPagination";

function CharacterSearch() {
  const { t, i18n } = useTranslation();
  const setModal = useModalStore((state) => state.setModal);
  const { displayMode, showRealName } = useConfigStore();
  const {
    styleFilter,
    manifestFilter,
    categoryFilter,
    alterFilter,
    lightShadowFilter,
    staralignFilter,
    essenTialPersonalityTags,
    choosePersonalityTags,
    dungeon,
    searchWord,
  } = useFilterStore();
  const { isPending, data } = useQuery({
    queryKey: ["getCharacters"],
    queryFn: () => fetchAPI("character"),
    throwOnError: true,
  });

  const allCharacters = isPending
    ? []
    : [...(data as APIResponse<CharacterSummary[]>).data].sort(
        createCharacterSorter(t, i18n.language, showRealName)
      );

  const filteredCharacters = allCharacters.filter(
    (char) =>
      styleFilter.includes(char.style as AECharacterStyles) &&
      manifestFilter.includes(char.maxManifest as AEManifestLevels) &&
      categoryFilter.includes(char.category as AECategories) &&
      alterFilter.includes(char.isAlter as AEAlterStatus) &&
      lightShadowFilter.includes(char.lightShadow as AELightShadow) &&
      staralignFilter.includes(char.isAwaken as AEAwakenStatus) &&
      arrAllIncludes(
        char.personalityIds,
        essenTialPersonalityTags
      ) &&
      (choosePersonalityTags.length <= 0 ||
        arrOverlap(
          char.personalityIds,
          choosePersonalityTags
        )) &&
      (!dungeon || char.dungeons.some((d) => d.id === dungeon)) &&
      matchesCharacterSearch(char, t, searchWord, showRealName)
  );

  const itemsPerPage = getItemsPerPage("avatar");
  const {
    page,
    setPage,
    totalPages,
    observerTarget,
    getCurrentItems,
    hasMore,
  } = usePagination<CharacterSummary>({
    totalItems: filteredCharacters.length,
    displayMode,
    itemsPerPage,
    dependencies: [
      styleFilter,
      manifestFilter,
      categoryFilter,
      alterFilter,
      lightShadowFilter,
      staralignFilter,
      essenTialPersonalityTags,
      choosePersonalityTags,
      dungeon,
      searchWord,
      showRealName,
    ],
  });

  if (isPending) return <Loading />;

  const currentCharacters = getCurrentItems(filteredCharacters);

  return (
    <div className="flex-grow pt-6">
      <GlobalFilter type={CheckMenuOptions.characters} />
      {displayMode === DisplayMode.pagination && (
        <div className="flex justify-center mt-4 mb-4">
          <ListPagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      )}

      <div className="px-4 py-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(75px,1fr))] gap-6">
          {currentCharacters.map((char) => (
            <CharacterAvatar
              key={`search-${char.id}`}
              info={char}
              disableShadow={false}
              onClick={() => setModal(ModalType.character, char.id)}
            />
          ))}
        </div>
        {displayMode === DisplayMode.infiniteScroll && hasMore && (
          <div
            ref={observerTarget}
            className="h-20 flex items-center justify-center text-sm text-muted-foreground mt-4"
          >
            Loading more characters...
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterSearch;
