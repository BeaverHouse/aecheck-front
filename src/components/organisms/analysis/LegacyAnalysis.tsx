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

  /**
   * 1. 없어야 함
   * 2. inven과 클체가능 목록이 겹치는 게 없어야 함
   * 3. 본인 id 앞에 같은 code가 없을 경우만 표시
   */
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

  const CollapseOptions = [
    {
      label: "frontend.analyze.legacy.owned",
      value: owned,
      part: WeaponSort ? AEData.weaponTags : AEData.elementTags,
    },
  ];

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

  return (
    <div id="ae-wrapper" className="m-2 mt-6 flex flex-col items-center justify-center gap-4 bg-background">
      <p className="text-base font-medium">
        {t("frontend.analyze.legacy.description")}
      </p>
      <DownloadButton tag="ae-wrapper" />

      <Accordion type="multiple" value={Opened} onValueChange={setOpened} className="w-[98%] max-w-[1100px]">
        <AccordionItem value="0">
          <AccordionTrigger>{t("frontend.analyze.legacy.notowned")}</AccordionTrigger>
          <AccordionContent className="text-center">
            {Object.values(AECategories).map((category) => {
              const filtered = notOwned.filter((char) => char.category === category);
              return filtered.length > 0 ? (
                <div key={category} className="mb-6">
                  <h3 className="mt-4 mb-3 py-2 px-4 flex justify-center items-center text-xl font-semibold bg-muted rounded-lg border border-border">
                    {t(`frontend.category.${category.toLowerCase()}`)} ({filtered.length})
                  </h3>
                  <Suspense fallback={<Loading />}>
                    {renderCharacterGrid(filtered)}
                  </Suspense>
                </div>
              ) : null;
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="1">
          <AccordionTrigger>{t("frontend.analyze.legacy.onlyfour")}</AccordionTrigger>
          <AccordionContent className="text-center">
            {Object.values(AECategories).map((category) => {
              const filtered = onlyFour.filter((char) => char.category === category);
              return filtered.length > 0 ? (
                <div key={category} className="mb-6">
                  <h3 className="mt-4 mb-3 py-2 px-4 flex justify-center items-center text-xl font-semibold bg-muted rounded-lg border border-border">
                    {t(`frontend.category.${category.toLowerCase()}`)} ({filtered.length})
                  </h3>
                  <Suspense fallback={<Loading />}>
                    {renderCharacterGrid(filtered)}
                  </Suspense>
                </div>
              ) : null;
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="2">
          <AccordionTrigger>{t("frontend.analyze.legacy.classchange")}</AccordionTrigger>
          <AccordionContent className="text-center">
            {Object.values(AECharacterStyles).map((style) => {
              if (style === AECharacterStyles.four) return null;
              const filtered = ccAvailable.filter((char) => char.style === style);
              return filtered.length > 0 ? (
                <div key={style} className="mb-6">
                  <h3 className="mt-4 mb-3 py-2 px-4 flex justify-center items-center text-xl font-semibold bg-muted rounded-lg border border-border">
                    {style} ({filtered.length})
                  </h3>
                  <Suspense fallback={<Loading />}>
                    {renderCharacterGrid(filtered)}
                  </Suspense>
                </div>
              ) : null;
            })}
          </AccordionContent>
        </AccordionItem>

        {CollapseOptions.map((opt, idx) =>
          opt.value.length > 0 ? (
            <AccordionItem key={3 + idx} value="3">
              <AccordionTrigger>{t(opt.label)}</AccordionTrigger>
              <AccordionContent className="text-center">
                {opt.label === "frontend.analyze.legacy.owned" ? (
                  <div className="m-4 mt-0 flex items-center justify-center gap-2">
                    <Label htmlFor="sort-switch">{t("frontend.analyze.legacy.sortelement")}</Label>
                    <Switch
                      id="sort-switch"
                      checked={WeaponSort}
                      onCheckedChange={handleSort}
                    />
                    <Label>{t("frontend.analyze.legacy.sortweapon")}</Label>
                  </div>
                ) : null}
                {opt.part.map((p) => {
                  const filtered = opt.value.filter((val) =>
                    val.personalityIds.includes(p)
                  );
                  return filtered.length > 0 ? (
                    <div key={p} className="mb-6">
                      <h3 className="mt-4 mb-3 py-2 px-4 flex justify-center items-center text-xl font-semibold bg-muted rounded-lg border border-border">
                        {p.startsWith("personality") ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${p}.png`}
                            alt={p}
                            className="w-[30px] h-[30px] mr-2.5 pointer-events-none"
                          />
                        ) : null}
                        {t(p)} ({filtered.length})
                      </h3>
                      <Suspense fallback={<Loading />}>
                        {renderCharacterGrid(filtered)}
                      </Suspense>
                    </div>
                  ) : null;
                })}
              </AccordionContent>
            </AccordionItem>
          ) : null
        )}
      </Accordion>
    </div>
  );
};

export default LegacyAnalysis;
