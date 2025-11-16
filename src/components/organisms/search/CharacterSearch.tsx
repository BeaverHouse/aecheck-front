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
import { getShortName } from "../../../util/func";
import { useTranslation } from "react-i18next";
import GlobalFilter from "../../molecules/GlobalFilter";
import useFilterStore from "../../../store/useFilterStore";
import useConfigStore from "../../../store/useConfigStore";
import Loading from "../../atoms/Loading";
import { arrAllIncludes, arrOverlap } from "../../../util/arrayUtil";
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAPI } from "../../../util/api";
import dayjs from "dayjs";
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

  const [page, setPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(50);
  const observerTarget = useRef<HTMLDivElement>(null);

  const allCharacters = isPending ? [] : (data as APIResponse<CharacterSummary[]>).data.sort(
    (a, b) => {
      const aIsRecent = dayjs()
        .subtract(3, "week")
        .isBefore(dayjs(a.updateDate));
      const bIsRecent = dayjs()
        .subtract(3, "week")
        .isBefore(dayjs(b.updateDate));

      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;

      return getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      );
    }
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
      (!dungeon || char.dungeons.map((d) => d.id).includes(dungeon)) &&
      (t(char.code).toLowerCase().includes(searchWord.toLowerCase()) ||
        t(`book.${char.id}`).toLowerCase().includes(searchWord.toLowerCase()))
  );

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (loadedCount < filteredCharacters.length) {
      setLoadedCount((prev) => Math.min(prev + 50, filteredCharacters.length));
    }
  }, [loadedCount, filteredCharacters.length]);

  useEffect(() => {
    setPage(1);
    setLoadedCount(50);
  }, [
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
  ]);

  useEffect(() => {
    if (displayMode !== DisplayMode.infiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayMode, loadMore]);

  if (isPending) return <Loading />;

  const getItemsPerPage = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 72; // lg
    if (width >= 900) return 48; // md
    if (width >= 600) return 36; // sm
    return 20; // xs
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);

  const currentCharacters =
    displayMode === DisplayMode.infiniteScroll
      ? filteredCharacters.slice(0, loadedCount)
      : filteredCharacters.slice(
          (page - 1) * itemsPerPage,
          page * itemsPerPage
        );

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
        {displayMode === DisplayMode.infiniteScroll &&
          loadedCount < filteredCharacters.length && (
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
