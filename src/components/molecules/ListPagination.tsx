import type { Dispatch, SetStateAction } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

interface ListPaginationProps {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

// Sits below the list: phones get arrows around "page / total", wider screens the page numbers.
export default function ListPagination({
  page,
  setPage,
  totalPages,
}: ListPaginationProps) {
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstPage + index,
  );
  const goTo = (target: number) => {
    setPage(target);
    window.scrollTo({ top: 0 });
  };

  return (
    <Pagination className="py-4">
      <PaginationContent className="gap-2">
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            aria-label="Go to previous page"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className="px-3"
          >
            <ChevronLeft />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </PaginationItem>
        <PaginationItem className="min-w-16 text-center text-sm font-medium tabular-nums text-foreground sm:hidden">
          {page} / {totalPages}
        </PaginationItem>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber} className="hidden sm:block">
            <Button
              type="button"
              variant={page === pageNumber ? "default" : "ghost"}
              size="icon"
              aria-current={page === pageNumber ? "page" : undefined}
              onClick={() => goTo(pageNumber)}
            >
              {pageNumber}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            aria-label="Go to next page"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            className="px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
