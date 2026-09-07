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

export default function ListPagination({
  page,
  setPage,
  totalPages,
}: ListPaginationProps) {
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstPage + index
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            aria-label="Go to previous page"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="gap-1 pl-2.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
        </PaginationItem>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <Button
              type="button"
              variant={page === pageNumber ? "outline" : "ghost"}
              size="icon"
              aria-current={page === pageNumber ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            aria-label="Go to next page"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => Math.max(1, Math.min(totalPages, current + 1)))
            }
            className="gap-1 pr-2.5"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
