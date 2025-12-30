import React from "react";
import { useTranslation } from "react-i18next";
import { arrAllIncludes } from "../../../util/arrayUtil";
import { getShortName } from "../../../util/func";
import { AEData } from "../../../constants";
import { AECharacterStyles, ModalType } from "../../../constants/enum";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import DownloadButton from "../../atoms/button/Download";

const LegacyTableAnalysis: React.FC<AnalysisProps> = ({ allCharacters }) => {
  const { t, i18n } = useTranslation();
  const { setModal } = useModalStore();

  const baseCharacters = allCharacters
    .concat()
    .sort((a, b) =>
      getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      )
    );

  // CSS Grid Template: 1st col fixed (weapon), rest flexible but min-width
  const gridTemplateColumns = `60px repeat(${AEData.elementTags.length}, minmax(360px, 1fr))`;

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <div className="flex justify-between items-center bg-background z-10">
        <h2 className="text-xl font-bold">
          {t("frontend.menu.analysis")} (Table)
        </h2>
        <DownloadButton tag="ae-table" />
      </div>

      <div
        id="ae-table"
        className="w-full overflow-auto border border-border rounded-lg bg-background"
        style={{ maxHeight: "calc(100vh - 150px)" }}
      >
        <div
          className="grid bg-muted/20"
          style={{ gridTemplateColumns, minWidth: "max-content" }}
        >
          {/* Header Row */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm p-4 flex items-center justify-center">
            {/* Empty corner cell */}
          </div>
          {AEData.elementTags.map((element, idx) => (
            <div
              key={idx}
              className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm p-4 flex items-center justify-center border-l border-border/50"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${element}.png`}
                alt={element}
                className="w-8 h-8 object-contain"
              />
            </div>
          ))}

          {/* Data Rows */}
          {AEData.weaponTags.map((weapon, weaponIdx) => (
            <React.Fragment key={weapon}>
              {/* Row Header (Weapon) */}
              <div className="bg-background border-r border-border p-4 flex items-center justify-center sticky left-0 z-[5] border-b border-border/50">
                <img
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${weapon}.png`}
                  alt={weapon}
                  className="w-8 h-8 object-contain"
                />
              </div>

              {/* Cells */}
              {AEData.elementTags.map((element, elementIdx) => {
                const filteredChars = baseCharacters.filter(
                  (c) =>
                    arrAllIncludes(c.personalityIds, [weapon, element]) &&
                    c.style !== AECharacterStyles.four
                );

                const isAlternate = (weaponIdx + elementIdx) % 2 === 1;

                return (
                  <div
                    key={`${weapon}-${element}`}
                    className={`p-4 border-b border-border/50 border-l border-border/50 min-h-[120px] flex content-start items-start justify-center isolate ${
                      isAlternate ? "bg-muted/30" : "bg-transparent"
                    }`}
                  >
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-x-4 gap-y-4 w-full place-items-center">
                      {filteredChars.map((info) => (
                        <CharacterAvatar
                          key={info.id}
                          info={info}
                          disableShadow={false}
                          disableGray={false}
                          onClick={() => setModal(ModalType.character, info.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegacyTableAnalysis;
