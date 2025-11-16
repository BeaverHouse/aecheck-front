import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import useCheckStore from "../../../store/useCheckStore";
import useConfigStore from "../../../store/useConfigStore";
import { getManifestStatus, getNumber, getShortName } from "../../../util/func";
import CharacterManifest from "../../molecules/character/Manifest";
import ManifestFilterButton from "../../atoms/button/ManifestFilter";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { DisplayMode, WeaponTemperingStatus } from "../../../constants/enum";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function ManifestDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { manifestStatusFilter, weaponTemperingStatusFilter } = useFilterStore();
  const { inven, manifest, setManifest, weaponTempering } = useCheckStore();
  const { displayMode } = useConfigStore();

  const targetCharacters = filteredCharacters
    .filter((char) => char.maxManifest > 0)
    .filter((char) =>
      manifestStatusFilter.includes(
        getManifestStatus(allCharacters, char, inven, manifest)
      )
    )
    .filter((char) => {
      if (weaponTemperingStatusFilter.includes(WeaponTemperingStatus.all)) {
        return true;
      }

      const hasWeaponTempering = weaponTempering.some(
        (x) => x % 10000 === getNumber(char) && x >= 10000
      );
      const matchesAvailable =
        weaponTemperingStatusFilter.includes(WeaponTemperingStatus.available) &&
        char.customManifest;
      const matchesCompleted =
        weaponTemperingStatusFilter.includes(WeaponTemperingStatus.completed) &&
        hasWeaponTempering;

      return matchesAvailable || matchesCompleted;
    })
    .sort((a, b) => {
      const aIsRecent = dayjs()
        .subtract(3, "week")
        .isBefore(dayjs(a.lastUpdated));
      const bIsRecent = dayjs()
        .subtract(3, "week")
        .isBefore(dayjs(b.lastUpdated));

      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;

      return getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      );
    });

  const checkAll = () => {
    Swal.fire({
      text: t("frontend.message.manifest.checkall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const ids = targetCharacters.map((char) => getNumber(char));

        const newManifest = [
          ...manifest.filter((i) => !ids.includes(i % 10000)),
          ...targetCharacters
            .filter(
              (char) => char.maxManifest > 0 && inven.includes(getNumber(char))
            )
            .map((char) => char.maxManifest * 10000 + getNumber(char)),
        ];

        setManifest(newManifest);
      }
    });
  };

  const uncheckAll = () => {
    Swal.fire({
      text: t("frontend.message.manifest.uncheckall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const ids = targetCharacters.map((char) => getNumber(char));

        const newManifest = [
          ...manifest.filter((i) => !ids.includes(i % 10000)),
        ];

        setManifest(newManifest);
      }
    });
  };

  const [page, setPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(50);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPage(1);
    setLoadedCount(50);
  }, [filteredCharacters, manifestStatusFilter, weaponTemperingStatusFilter]);

  const getItemsPerPage = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 24; // lg
    if (width >= 900) return 18; // md
    if (width >= 600) return 12; // sm
    return 6; // xs
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(targetCharacters.length / itemsPerPage);

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
        <ManifestFilterButton />
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

      <div className="flex-grow overflow-auto px-2 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
          {currentCharacters.map((char) => (
            <CharacterManifest
              key={`manifest-${char.id}`}
              info={char}
              status={getManifestStatus(allCharacters, char, inven, manifest)}
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

export default ManifestDashboard;
