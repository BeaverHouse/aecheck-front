import React, { Suspense } from "react";
import useCheckStore from "../../../store/useCheckStore";
import { getInvenStatus, getShortName } from "../../../util/func";
import dayjs from "dayjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Loading from "../../atoms/Loading";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AECategories,
  AECharacterStyles,
  InvenStatus,
  ModalType,
} from "../../../constants/enum";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import DownloadButton from "../../atoms/button/Download";

const StardreamAnalysis: React.FC<AnalysisProps> = ({ allCharacters }) => {
  const [Opened, setOpened] = React.useState(["0", "1", "2", "3", "4", "5"]);
  const [ShowRecentStyles, setShowRecentStyles] = React.useState(false);
  const [ShowSevenPiece, setShowSevenPiece] = React.useState(false);
  const { setModal } = useModalStore();
  const { inven } = useCheckStore();
  const { t, i18n } = useTranslation();

  const baseCharacters = allCharacters
    .concat()
    .filter(
      (char, idx) =>
        char.category === AECategories.encounter &&
        char.style !== AECharacterStyles.four &&
        (!ShowRecentStyles ||
          !allCharacters
            .slice(idx + 1)
            .map((c) => c.code)
            .includes(char.code)) &&
        (!ShowSevenPiece ||
          dayjs(char.updateDate!).day(1).add(3, "month").isBefore(dayjs()))
    )
    .sort((a, b) =>
      getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      )
    );

  const firstOptions = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.notOwned
  );
  const secondOptions = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.ccRequired
  );

  const firstEnabled = firstOptions.length > 0;
  const targetOptions = firstEnabled ? firstOptions : secondOptions;

  const CollapseOptions = [
    {
      label: "frontend.analyze.oneyear",
      value: targetOptions.filter((info) =>
        dayjs().subtract(1, "year").isBefore(dayjs(info.updateDate!))
      ),
    },
    {
      label: "frontend.analyze.havebuddy",
      value: targetOptions.filter((char) => char.buddy !== null),
    },
    {
      label: "frontend.filter.alter",
      value: targetOptions.filter((char) => char.isAlter),
    },
    {
      label: "frontend.analyze.extra",
      value: targetOptions.filter(
        (char) => char.style === AECharacterStyles.extra
      ),
    },
    {
      label: "frontend.analyze.another",
      value: targetOptions.filter(
        (char) => char.style === AECharacterStyles.another
      ),
    },
    {
      label: "frontend.analyze.normal",
      value: targetOptions.filter(
        (char) => char.style === AECharacterStyles.normal
      ),
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
    <div id="ae-wrapper" className="m-2 flex flex-col items-center justify-center text-center">
      <p className="m-4 text-base font-medium">
        {t("frontend.analyze.stardream.description")}
      </p>
      <div className="flex items-center gap-4">
        <DownloadButton tag="ae-wrapper" />
        <div className="ml-4 flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recent-styles"
              checked={ShowRecentStyles}
              onCheckedChange={(checked) => setShowRecentStyles(checked === true)}
            />
            <Label htmlFor="recent-styles" className="text-sm">
              {t("frontend.analyze.stardream.option")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="seven-piece"
              checked={ShowSevenPiece}
              onCheckedChange={(checked) => setShowSevenPiece(checked === true)}
            />
            <Label htmlFor="seven-piece" className="text-sm">
              {t("frontend.analyze.stardream.seven")}
            </Label>
          </div>
        </div>
      </div>
      {!firstEnabled && targetOptions.length > 0 && (
        <p className="mt-4 text-sm">
          {t("frontend.analyze.stardream.level1")}
        </p>
      )}
      {targetOptions.length > 0 ? (
        <Accordion type="multiple" value={Opened} onValueChange={setOpened} className="w-[98%] max-w-[1100px]">
          {CollapseOptions.map((opt, idx) =>
            opt.value.length > 0 ? (
              <AccordionItem key={idx} value={String(idx)}>
                <AccordionTrigger>{t(opt.label)}</AccordionTrigger>
                <AccordionContent>
                  <Suspense fallback={<Loading />}>
                    {renderCharacterGrid(opt.value)}
                  </Suspense>
                </AccordionContent>
              </AccordionItem>
            ) : null
          )}
        </Accordion>
      ) : (
        <>
          <img src="/happy.png" alt="empty" />
          <h2 className="m-4 text-xl font-semibold">
            {t("frontend.analyze.whitekey.empty")}
          </h2>
        </>
      )}
    </div>
  );
};

export default StardreamAnalysis;
