import InvenFilterButton from "../../atoms/button/InvenFilter";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import useCheckStore from "../../../store/useCheckStore";
import { getNumber, getInvenStatus, getShortName } from "../../../util/func";
import {
  AECharacterStyles,
  DisplayMode,
  ModalType,
  PopupOnCheckOptions,
} from "../../../constants/enum";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import useConfigStore from "../../../store/useConfigStore";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function CharacterDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { invenStatusFilter } = useFilterStore();
  const { inven, buddy, setInven, setBuddy } = useCheckStore();
  const { popupOnCheck, displayMode } = useConfigStore();
  const { setModal } = useModalStore();

  const [page, setPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(50); // For infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const targetCharacters = filteredCharacters
    .filter(
      (char) =>
        getNumber(char) < 1000 &&
        invenStatusFilter.includes(getInvenStatus(allCharacters, char, inven))
    )
    .sort((a, b) => {
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
    });

  const addSingleInven = (char: CharacterSummary) => {
    const newCharIds = [...inven, getNumber(char)];

    const fourStarChar = allCharacters.find(
      (c) => c.code === char.code && c.style === AECharacterStyles.four
    );
    if (fourStarChar && char.style === AECharacterStyles.normal) {
      newCharIds.push(getNumber(fourStarChar));
    }

    setInven(newCharIds);

    if (char.buddy) {
      const newBuddyIds = [...buddy, getNumber(char.buddy)];
      setBuddy(newBuddyIds);
    }

    if (
      popupOnCheck === PopupOnCheckOptions.all ||
      (popupOnCheck === PopupOnCheckOptions.fourOnly &&
        char.style === AECharacterStyles.four)
    ) {
      setModal(ModalType.character, char.id);
    }
  };

  const removeSingleInven = (char: CharacterSummary) => {
    const removeCharIds = [getNumber(char)];

    const isFourStar = char.style === AECharacterStyles.four;
    const NSChar = allCharacters.find(
      (c) => c.code === char.code && c.style === AECharacterStyles.normal
    );

    if (isFourStar && NSChar) {
      removeCharIds.push(getNumber(NSChar));
    }

    setInven(inven.filter((i) => !removeCharIds.includes(i)));

    if (char.buddy) {
      setBuddy(buddy.filter((b) => b !== getNumber(char.buddy!)));
    }
  };

  const checkAll = () => {
    Swal.fire({
      text: t("frontend.message.character.checkall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const newInven = [
          ...inven,
          ...targetCharacters.map((char) => getNumber(char)),
        ];

        const newCodes = targetCharacters.map((char) => char.code);

        const fourStars = allCharacters.filter(
          (char) =>
            char.style === AECharacterStyles.four &&
            newCodes.includes(char.code)
        );
        for (const char of fourStars) {
          newInven.push(getNumber(char));
        }
        setInven(newInven);

        const newBuddy = [
          ...buddy,
          ...targetCharacters
            .filter((char) => char.buddy)
            .map((char) => getNumber(char.buddy!)),
        ];
        setBuddy(newBuddy);
      }
    });
  };

  const uncheckAll = () => {
    Swal.fire({
      text: t("frontend.message.character.uncheckall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const removeInven = [
          ...targetCharacters.map((char) => getNumber(char)),
        ];

        const newCodes = targetCharacters.map((char) => char.code);

        const normalStyles = allCharacters.filter(
          (char) =>
            char.style === AECharacterStyles.normal &&
            newCodes.includes(char.code)
        );
        for (const char of normalStyles) {
          removeInven.push(getNumber(char));
        }
        setInven(inven.filter((i) => !removeInven.includes(i)));

        const removeBuddy = [
          ...targetCharacters
            .filter((char) => char.buddy)
            .map((char) => getNumber(char.buddy!)),
        ];
        setBuddy(buddy.filter((b) => !removeBuddy.includes(b)));
      }
    });
  };

  const toggleSingleInven = (char: CharacterSummary) => {
    const id = getNumber(char);
    if (inven.includes(id)) {
      removeSingleInven(char);
    } else {
      addSingleInven(char);
    }
  };

  const getItemsPerPage = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 72; // lg
    if (width >= 900) return 48; // md
    if (width >= 600) return 36; // sm
    return 20; // xs
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(targetCharacters.length / itemsPerPage);

  // Reset loaded count when filters change
  useEffect(() => {
    setLoadedCount(50);
  }, [targetCharacters.length]);

  // Pagination mode: reset page when filters change
  useEffect(() => {
    if (displayMode === DisplayMode.pagination) {
      const maxPage = Math.ceil(targetCharacters.length / itemsPerPage);
      if (page > maxPage) {
        setPage(maxPage || 1);
      }
    }
  }, [targetCharacters, page, itemsPerPage, displayMode]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (loadedCount < targetCharacters.length) {
      setLoadedCount((prev) => Math.min(prev + 50, targetCharacters.length));
    }
  }, [loadedCount, targetCharacters.length]);

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

  // Determine which characters to display based on mode
  const currentCharacters =
    displayMode === DisplayMode.infiniteScroll
      ? targetCharacters.slice(0, loadedCount)
      : targetCharacters.slice(
          (page - 1) * itemsPerPage,
          page * itemsPerPage
        );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col items-center gap-2 mb-2 px-4">
        <InvenFilterButton />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => uncheckAll()}
          >
            CLEAR ALL
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => checkAll()}
          >
            CHECK ALL
          </Button>
        </div>
      </div>
      {displayMode === DisplayMode.pagination && (
        <div className="flex justify-center mb-4 mt-4">
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
      <div className="flex-grow overflow-auto px-4 py-4 mt-2">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(75px,1fr))] gap-6">
          {currentCharacters.map((char) => (
            <CharacterAvatar
              key={`char-${char.id}`}
              info={char}
              disableShadow={false}
              onClick={() => toggleSingleInven(char)}
            />
          ))}
        </div>
        {displayMode === DisplayMode.infiniteScroll &&
         loadedCount < targetCharacters.length && (
          <div
            ref={observerTarget}
            className="h-20 flex items-center justify-center text-sm text-muted-foreground"
          >
            Loading more characters...
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterDashboard;
