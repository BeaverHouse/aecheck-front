import { useQuery } from "@tanstack/react-query";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import {
  DisplayMode,
  ModalType,
  CheckMenuOptions,
} from "../../../constants/enum";
import { createCharacterSorter } from "../../../util/func";
import { useCharacterFilter } from "../../../hooks/useCharacterFilter";
import { useTranslation } from "react-i18next";
import GlobalFilter from "../../molecules/GlobalFilter";
import useFilterStore from "../../../store/useFilterStore";
import useConfigStore from "../../../store/useConfigStore";
import Loading from "../../atoms/Loading";
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
  const matchesFilter = useCharacterFilter();
  const { isPending, data } = useQuery({
    queryKey: ["getCharacters"],
    queryFn: () => fetchAPI("character"),
    throwOnError: true,
  });

  const allCharacters = isPending
    ? []
    : [...(data as APIResponse<CharacterSummary[]>).data].sort(
        createCharacterSorter(t, i18n.language, showRealName),
      );

  const filteredCharacters = allCharacters.filter(matchesFilter);

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
      {displayMode === DisplayMode.pagination && (
        <ListPagination page={page} setPage={setPage} totalPages={totalPages} />
      )}
    </div>
  );
}

export default CharacterSearch;
