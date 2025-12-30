import React, { Suspense } from "react";
import useCheckStore from "../../../store/useCheckStore";
import { getInvenStatus, getNumber } from "../../../util/func";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Loading from "../../atoms/Loading";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AECategories,
  AECharacterStyles,
  InvenStatus,
  ModalType,
} from "../../../constants/enum";
import { AEData } from "../../../constants";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import DownloadButton from "../../atoms/button/Download";

const LegacyAnalysis: React.FC<AnalysisProps> = ({ allCharacters }) => {
  const [Opened, setOpened] = React.useState(["0", "1", "2", "3"]);
  const [WeaponSort, setWeaponSort] = React.useState(false);
  const { setModal } = useModalStore();
  const { inven } = useCheckStore();
  const { t } = useTranslation();

  const baseCharacters = allCharacters
    .concat()
    .filter((char) => getNumber(char) < 1000)
    .sort((a, b) => a.id.localeCompare(b.id));

  const notOwned = baseCharacters.filter(
    (char, idx) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.notOwned &&
      !allCharacters
        .slice(0, idx)
        .map((c) => c.code)
        .includes(char.code)
  );

  const onlyFour = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.owned &&
      char.style === AECharacterStyles.four &&
      allCharacters.filter(
        (c) => c.code === char.code && inven.includes(getNumber(c))
      ).length === 1
  );

  const ccAvailable = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.ccRequired
  );

  const owned = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.owned &&
      char.style !== AECharacterStyles.four
  );

  const handleSort = (checked: boolean) => setWeaponSort(checked);

  const renderCharacterGrid = (characters: CharacterSummary[]) => (
    <div className="grid grid-cols-[repeat(auto-fill,75px)] justify-center gap-4">
      {characters.map((c) => (
        <CharacterAvatar
          key={c.id}
          info={c}
          disableShadow={false}
          disableGray={true}
          onClick={() => setModal(ModalType.character, c.id)}
        />
      ))}
    </div>
  );

  const renderCategorySection = (
    characters: CharacterSummary[],
    categories: AECategories[]
  ) => (
    <div className="space-y-6">
      {categories.map((category) => {
        const filtered = characters.filter(
          (char) => char.category === category
        );
        if (filtered.length === 0) return null;
        return (
          <div key={category}>
            <h4 className="flex items-center gap-2 text-base font-semibold mb-3 pb-2 border-b border-border text-foreground">
              {t(`frontend.category.${category.toLowerCase()}`)}
              <span className="text-muted-foreground text-sm font-normal">
                ({filtered.length})
              </span>
            </h4>
            <Suspense fallback={<Loading />}>
              {renderCharacterGrid(filtered)}
            </Suspense>
          </div>
        );
      })}
    </div>
  );

  const renderStyleSection = (characters: CharacterSummary[]) => (
    <div className="space-y-6">
      {Object.values(AECharacterStyles).map((style) => {
        if (style === AECharacterStyles.four) return null;
        const filtered = characters.filter((char) => char.style === style);
        if (filtered.length === 0) return null;
        return (
          <div key={style}>
            <h4 className="flex items-center gap-2 text-base font-semibold mb-3 pb-2 border-b border-border text-foreground">
              {style}
              <span className="text-muted-foreground text-sm font-normal">
                ({filtered.length})
              </span>
            </h4>
            <Suspense fallback={<Loading />}>
              {renderCharacterGrid(filtered)}
            </Suspense>
          </div>
        );
      })}
    </div>
  );

  const renderOwnedSection = (characters: CharacterSummary[]) => {
    const parts = WeaponSort ? AEData.weaponTags : AEData.elementTags;
    return (
      <div className="space-y-6">
        {parts.map((p) => {
          const filtered = characters.filter((val) =>
            val.personalityIds.includes(p)
          );
          if (filtered.length === 0) return null;
          return (
            <div key={p}>
              <h4 className="flex items-center gap-2 text-base font-semibold mb-3 pb-2 border-b border-border text-foreground">
                {p.startsWith("personality") && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${p}.png`}
                    alt={p}
                    className="w-6 h-6"
                  />
                )}
                {t(p)}
                <span className="text-muted-foreground text-sm font-normal">
                  ({filtered.length})
                </span>
              </h4>
              <Suspense fallback={<Loading />}>
                {renderCharacterGrid(filtered)}
              </Suspense>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="ae-wrapper"
      className="w-full max-w-[1200px] mx-auto p-2 md:p-6 lg:p-8 space-y-6 md:space-y-8"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          {t("frontend.analyze.legacy.description")}
        </p>
        <DownloadButton tag="ae-wrapper" />
      </div>

      <Accordion
        type="multiple"
        value={Opened}
        onValueChange={setOpened}
        className="w-full"
      >
        {notOwned.length > 0 && (
          <AccordionItem value="0">
            <AccordionTrigger>
              {t("frontend.analyze.legacy.notowned")}
            </AccordionTrigger>
            <AccordionContent>
              {renderCategorySection(
                notOwned,
                Object.values(AECategories)
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {onlyFour.length > 0 && (
          <AccordionItem value="1">
            <AccordionTrigger>
              {t("frontend.analyze.legacy.onlyfour")}
            </AccordionTrigger>
            <AccordionContent>
              {renderCategorySection(
                onlyFour,
                Object.values(AECategories)
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {ccAvailable.length > 0 && (
          <AccordionItem value="2">
            <AccordionTrigger>
              {t("frontend.analyze.legacy.classchange")}
            </AccordionTrigger>
            <AccordionContent>
              {renderStyleSection(ccAvailable)}
            </AccordionContent>
          </AccordionItem>
        )}

        {owned.length > 0 && (
          <AccordionItem value="3">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-2">
                <span>{t("frontend.analyze.legacy.owned")}</span>
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Label
                    htmlFor="sort-switch"
                    className="text-sm font-normal text-muted-foreground"
                  >
                    {t("frontend.analyze.legacy.sortelement")}
                  </Label>
                  <Switch
                    id="sort-switch"
                    checked={WeaponSort}
                    onCheckedChange={handleSort}
                  />
                  <Label className="text-sm font-normal text-muted-foreground">
                    {t("frontend.analyze.legacy.sortweapon")}
                  </Label>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {renderOwnedSection(owned)}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default LegacyAnalysis;
