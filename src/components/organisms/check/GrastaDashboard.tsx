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
import CharacterGrasta from "../../molecules/character/Grasta";
import GrastaFilterButton from "../../atoms/button/GrastaFilter";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import BulkActionsMenu from "@/components/molecules/BulkActionsMenu";
import InvenFilterButton from "../../atoms/button/InvenFilter";
import Swal from "sweetalert2";
import {
  AECharacterStyles,
  DisplayMode,
  GrastaWeaponTemperingFilter,
} from "../../../constants/enum";
import { usePagination, getItemsPerPage } from "../../../hooks/usePagination";
import ListPagination from "@/components/molecules/ListPagination";

function GrastaDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { inven, grasta, setGrasta } = useCheckStore();
  const { invenStatusFilter, grastaStatusFilter, grastaWeaponTemperingFilter } =
    useFilterStore();
  const { displayMode, showRealName } = useConfigStore();

  const targetCharacters = filteredCharacters
    .filter(
      (char) =>
        char.style !== AECharacterStyles.four && char.dungeons.length > 0,
    )
    .filter(
      (char) =>
        grastaStatusFilter.includes(getStep(getNumber(char), grasta)) &&
        invenStatusFilter.includes(getInvenStatus(allCharacters, char, inven)),
    )
    .filter((char) => {
      if (
        grastaWeaponTemperingFilter.length === 0 ||
        (grastaWeaponTemperingFilter.includes(
          GrastaWeaponTemperingFilter.hasWeaponTempering,
        ) &&
          grastaWeaponTemperingFilter.includes(
            GrastaWeaponTemperingFilter.noWeaponTempering,
          ))
      ) {
        return true;
      }

      const hasWeaponTempering = char.customManifest;
      const matchesHas =
        grastaWeaponTemperingFilter.includes(
          GrastaWeaponTemperingFilter.hasWeaponTempering,
        ) && hasWeaponTempering;
      const matchesNo =
        grastaWeaponTemperingFilter.includes(
          GrastaWeaponTemperingFilter.noWeaponTempering,
        ) && !hasWeaponTempering;

      return matchesHas || matchesNo;
    })
    .sort(createCharacterSorter(t, i18n.language, showRealName));

  const changeAllGrasta = (step: number) => {
    Swal.fire({
      text: t("frontend.message.grasta.changeall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const newGrasta = grasta.filter(
          (m) =>
            !targetCharacters
              .map((info) => getNumber(info))
              .includes(m % 10000),
        );
        if (step > 0) {
          newGrasta.push(
            ...targetCharacters.map((char) => step * 10000 + getNumber(char)),
          );
        }
        setGrasta(newGrasta);
      }
    });
  };

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
    dependencies: [filteredCharacters, invenStatusFilter, grastaStatusFilter],
  });

  const currentCharacters = getCurrentItems(targetCharacters);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-center flex-wrap gap-2 px-4">
        <GrastaFilterButton />
        <InvenFilterButton />
        <BulkActionsMenu>
          {[0, 1, 2].map((step) => (
            <DropdownMenuItem onSelect={() => changeAllGrasta(step)} key={step}>
              <img
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/grasta${step}.png`}
                alt=""
                width={24}
                height={24}
              />
              {t("grasta.setAll", { label: t(`grasta.${step}`) })}
            </DropdownMenuItem>
          ))}
        </BulkActionsMenu>
      </div>
      <div className="flex-grow overflow-auto px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
          {currentCharacters.map((char) => (
            <CharacterGrasta key={`grasta-${char.id}`} {...char} />
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

export default GrastaDashboard;
