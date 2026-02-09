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
import { createCharacterSorter } from "../../../util/func";
import { useTranslation } from "react-i18next";
import GlobalFilter from "../../molecules/GlobalFilter";
import useFilterStore from "../../../store/useFilterStore";
import useConfigStore from "../../../store/useConfigStore";
import Loading from "../../atoms/Loading";
import { arrAllIncludes, arrOverlap } from "../../../util/arrayUtil";
import { fetchAPI } from "../../../util/api";
import { usePagination, getItemsPerPage } from "../../../hooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function CharacterSearch() {
  const { t, i18n } = useTranslation();
  const { setModal } = useModalStore();
  const { displayMode } = useConfigStore();
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
    : (data as APIResponse<CharacterSummary[]>).data.sort(
        createCharacterSorter(t, i18n.language)
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
      (t(char.code).toLowerCase().includes(searchWord.toLowerCase()) ||
        t(`book.${char.id}`).toLowerCase().includes(searchWord.toLowerCase()))
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
    ],
  });

  if (isPending) return <Loading />;

  const currentCharacters = getCurrentItems(filteredCharacters);

  return (
    <div className="flex-grow pt-6">
      <GlobalFilter type={CheckMenuOptions.characters} />
      {displayMode === DisplayMode.pagination && (
        <div className="flex justify-center mt-4 mb-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
