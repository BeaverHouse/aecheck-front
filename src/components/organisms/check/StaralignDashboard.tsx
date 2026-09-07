import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import useCheckStore from "../../../store/useCheckStore";
import useConfigStore from "../../../store/useConfigStore";
import {
  createCharacterSorter,
  getInvenStatus,
  getNumber,
  getStep,
} from "../../../util/func";
import CharacterStaralign from "../../molecules/character/Staralign";
import StaralignFilterButton from "../../atoms/button/StaralignFilter";
import InvenFilterButton from "../../atoms/button/InvenFilter";
import { DisplayMode } from "../../../constants/enum";
import { usePagination, getItemsPerPage } from "../../../hooks/usePagination";
import ListPagination from "@/components/molecules/ListPagination";

function StaralignDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { inven, staralign } = useCheckStore();
  const { invenStatusFilter, staralignStatusFilter } = useFilterStore();
  const { displayMode, showRealName } = useConfigStore();

  const targetCharacters = filteredCharacters
    .filter((char) => char.isAwaken)
    .filter(
      (char) =>
        staralignStatusFilter.includes(getStep(getNumber(char), staralign)) &&
        invenStatusFilter.includes(getInvenStatus(allCharacters, char, inven))
    )
    .sort(createCharacterSorter(t, i18n.language, showRealName));

  const itemsPerPage = getItemsPerPage("card");
  const {
    page,
    setPage,
    totalPages,
    observerTarget,
    getCurrentItems,
    hasMore,
  } = usePagination<CharacterSummary>({
    totalItems: targetCharacters.length,
    displayMode,
    itemsPerPage,
    dependencies: [filteredCharacters, invenStatusFilter, staralignStatusFilter],
  });

  const currentCharacters = getCurrentItems(targetCharacters);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-center flex-wrap gap-2 mb-2 px-4">
        <StaralignFilterButton />
        <InvenFilterButton />
      </div>
      {displayMode === DisplayMode.pagination && (
        <div className="flex justify-center mb-4 mt-4">
          <ListPagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      )}
      <div className="flex-grow overflow-auto px-2 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
          {currentCharacters.map((char) => (
            <CharacterStaralign key={`align-${char.id}`} {...char} />
          ))}
        </div>
        {displayMode === DisplayMode.infiniteScroll && hasMore && (
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

export default StaralignDashboard;
