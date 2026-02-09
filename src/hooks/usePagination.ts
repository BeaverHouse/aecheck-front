import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DisplayMode } from "../constants/enum";

interface UsePaginationOptions {
  totalItems: number;
  displayMode: DisplayMode;
  itemsPerPage: number;
  dependencies?: unknown[];
}

interface UsePaginationReturn<T> {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  loadedCount: number;
  observerTarget: React.RefObject<HTMLDivElement>;
  getCurrentItems: (items: T[]) => T[];
  hasMore: boolean;
}

export function usePagination<T>({
  totalItems,
  displayMode,
  itemsPerPage,
  dependencies = [],
}: UsePaginationOptions): UsePaginationReturn<T> {
  const [page, setPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(50);
  const observerTarget = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset on filter changes - stringify dependencies for stable comparison
  const depsKey = JSON.stringify(dependencies);
  useEffect(() => {
    setPage(1);
    setLoadedCount(50);
  }, [depsKey]);

  const loadMore = useCallback(() => {
    if (loadedCount < totalItems) {
      setLoadedCount((prev) => Math.min(prev + 50, totalItems));
    }
  }, [loadedCount, totalItems]);

  // Infinite scroll observer
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

  const getCurrentItems = useCallback(
    (items: T[]): T[] => {
      if (displayMode === DisplayMode.infiniteScroll) {
        return items.slice(0, loadedCount);
      }
      return items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    },
    [displayMode, loadedCount, page, itemsPerPage]
  );

  const hasMore = useMemo(
    () => loadedCount < totalItems,
    [loadedCount, totalItems]
  );

  return {
    page,
    setPage,
    totalPages,
    loadedCount,
    observerTarget: observerTarget as React.RefObject<HTMLDivElement>,
    getCurrentItems,
    hasMore,
  };
}

export function getItemsPerPage(type: "avatar" | "card"): number {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;

  if (type === "avatar") {
    if (width >= 1200) return 72;
    if (width >= 900) return 48;
    if (width >= 600) return 36;
    return 20;
  }

  // card type (manifest, staralign, grasta)
  if (width >= 1200) return 24;
  if (width >= 900) return 18;
  if (width >= 600) return 12;
  return 6;
}
