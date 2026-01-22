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

const WhiteKeyAnalysis: React.FC<AnalysisProps> = ({ allCharacters }) => {
  const [Opened, setOpened] = React.useState(["0", "1", "2", "3", "4"]);
  const [ShowNotOwned, setShowNotOwned] = React.useState(false);
  const { setModal } = useModalStore();
  const { inven } = useCheckStore();
  const { t, i18n } = useTranslation();

  const baseCharacters = allCharacters
    .concat()
    .filter(
      (char) =>
        char.category === AECategories.encounter &&
        (char.style === AECharacterStyles.extra ||
          char.style === AECharacterStyles.another ||
          char.isAlter)
    )
    .sort((a, b) =>
      getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      )
    );

  const firstOptions = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.ccRequired
  );
  const secondOptions = baseCharacters.filter(
    (char) => getInvenStatus(allCharacters, char, inven) !== InvenStatus.owned
  );
  const targetOptions = ShowNotOwned ? secondOptions : firstOptions;

  const CollapseOptions = [
    {
      label: "frontend.analyze.oneyear",
      value: targetOptions.filter((info) =>
        dayjs().subtract(1, "year").isBefore(dayjs(info.updateDate!))
      ),
    },
    {
      label: "alter.true",
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
    <div
      id="ae-wrapper"
      className="w-full max-w-[1200px] mx-auto p-2 md:p-6 lg:p-8 space-y-6 md:space-y-8 flex flex-col"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          {t("frontend.analyze.whitekey.description")}
        </p>
        <div className="flex items-center gap-4">
          <DownloadButton tag="ae-wrapper" />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-not-owned"
              checked={ShowNotOwned}
              onCheckedChange={(checked) => setShowNotOwned(checked === true)}
            />
            <Label htmlFor="show-not-owned" className="text-sm cursor-pointer">
              {t("frontend.analyze.whitekey.option")}
            </Label>
          </div>
        </div>
      </div>
      {targetOptions.length > 0 ? (
        <Accordion
          type="multiple"
          value={Opened}
          onValueChange={setOpened}
          className="w-full"
        >
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
        <div className="flex flex-col items-center justify-center py-10">
          <img src="/happy.png" alt="empty" className="max-w-[200px]" />
          <h2 className="mt-6 text-xl font-semibold">
            {t("frontend.analyze.whitekey.empty")}
          </h2>
        </div>
      )}
    </div>
  );
};

export default WhiteKeyAnalysis;
