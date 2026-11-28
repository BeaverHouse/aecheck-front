import InvenFilterButton from "../../atoms/button/InvenFilter";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import useCheckStore from "../../../store/useCheckStore";
import {
  createCharacterSorter,
  getNumber,
  getInvenStatus,
} from "../../../util/func";
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
import { usePagination, getItemsPerPage } from "../../../hooks/usePagination";
import ListPagination from "@/components/molecules/ListPagination";
import { useAddInven } from "../../../hooks/useAddInven";
import ScreenshotImport from "./ScreenshotImport";
import { CheckCheck, Eraser } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import BulkActionsMenu from "@/components/molecules/BulkActionsMenu";

function CharacterDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { invenStatusFilter } = useFilterStore();
  const { inven, buddy, setInven, setBuddy } = useCheckStore();
  const { popupOnCheck, displayMode, showRealName } = useConfigStore();
  const setModal = useModalStore((state) => state.setModal);

  const targetCharacters = filteredCharacters
    .filter(
      (char) =>
        getNumber(char) < 1000 &&
        invenStatusFilter.includes(getInvenStatus(allCharacters, char, inven)),
    )
    .sort(createCharacterSorter(t, i18n.language, showRealName));

  const addInven = useAddInven(allCharacters);

  const addSingleInven = (char: CharacterSummary) => {
    addInven([char]);

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
      (c) => c.code === char.code && c.style === AECharacterStyles.normal,
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
            newCodes.includes(char.code),
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
            newCodes.includes(char.code),
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

  const itemsPerPage = getItemsPerPage("avatar");
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
    dependencies: [filteredCharacters, invenStatusFilter],
  });

  const currentCharacters = getCurrentItems(targetCharacters);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        <InvenFilterButton />
        <ScreenshotImport allCharacters={allCharacters} />
        <BulkActionsMenu>
          <DropdownMenuItem onSelect={checkAll}>
            <CheckCheck />
            CHECK ALL
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={uncheckAll}>
            <Eraser />
            CLEAR ALL
          </DropdownMenuItem>
        </BulkActionsMenu>
      </div>
      <div className="flex-grow overflow-auto px-4 py-3">
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
        {displayMode === DisplayMode.infiniteScroll && hasMore && (
          <div
            ref={observerTarget}
            className="h-20 flex items-center justify-center text-sm text-muted-foreground"
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

export default CharacterDashboard;
