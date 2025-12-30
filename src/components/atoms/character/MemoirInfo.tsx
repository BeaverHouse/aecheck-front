import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AECharacterStyles } from "../../../constants/enum";
import useConfigStore from "../../../store/useConfigStore";

interface MemoirInfoProps {
  characterData: CharacterDetail;
  currentGrastaStep: number;
}

const MemoirInfo: React.FC<MemoirInfoProps> = ({
  characterData,
  currentGrastaStep,
}) => {
  const { t } = useTranslation();
  const { colorBlindMode } = useConfigStore();
  const bookName = t(`book.${characterData.id}`, "N/A");

  // Determine if sections should be displayed
  const hasBook = bookName !== "N/A";
  const hasDungeons =
    Array.isArray(characterData.dungeons) && characterData.dungeons.length > 0;

  // If neither section is available, don't render the card
  if (!hasBook && !hasDungeons) return null;

  return (
    <Card className="w-full mt-4 border shadow-sm bg-card/50">
      <CardContent className="p-4">
        {/* Class Name Section */}
        {hasBook && (
          <div className="flex flex-row items-center justify-center gap-4 mb-5">
            <div className="relative flex items-center justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/book.png`}
                alt="book"
                className="w-10 h-10 opacity-90"
              />
              <img
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/grasta${currentGrastaStep}.png`}
                alt="grasta"
                className="w-10 h-10 -ml-4 z-10 drop-shadow-md"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold text-foreground leading-none tracking-tight">
                {bookName}
              </span>
            </div>
          </div>
        )}

        {/* Drop Location Section */}
        {hasDungeons && (
          <div className="space-y-3">
            <div className="relative flex items-center py-2">
              {hasBook && (
                <div className="flex-grow border-t border-border"></div>
              )}
              <span
                className={cn(
                  "flex-shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wide",
                  hasBook && "mx-3",
                  !hasBook && "mb-2 block text-center w-full"
                )}
              >
                {t("frontend.filter.bookdrop")}
                {characterData.style === AECharacterStyles.four ? " (NS)" : ""}
              </span>
              {hasBook && (
                <div className="flex-grow border-t border-border"></div>
              )}
            </div>

            <div className="grid gap-2">
              {characterData.dungeons.map((dun) => {
                const isMainDungeon = dun.id.startsWith("dungeon0");

                // Color Logic
                let colorClass = "";
                if (colorBlindMode) {
                  // Colorblind Mode: Blue for Main, High-Contrast Gray/Yellow for Secondary
                  colorClass = isMainDungeon
                    ? "bg-blue-100/80 border-blue-300 text-blue-900 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-100"
                    : "bg-gray-100/80 border-gray-300 text-gray-900 dark:bg-gray-800/60 dark:border-gray-600 dark:text-gray-100";
                } else {
                  // Normal Mode: Emerald (Green) for Main, Amber (Yellow) for Secondary
                  colorClass = isMainDungeon
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-100"
                    : "bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-100";
                }

                return (
                  <div
                    key={dun.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:shadow-sm",
                      colorClass
                    )}
                  >
                    <span className="font-semibold pl-1 tracking-tight flex-grow text-left">
                      {t(dun.id)}
                    </span>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dun.altemaURL && (
                        <a
                          href={dun.altemaURL}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-transform hover:scale-110 focus:outline-none opacity-90 hover:opacity-100"
                          aria-label="Altema"
                        >
                          <Avatar className="w-8 h-8 border border-border bg-background shadow-sm">
                            <AvatarImage
                              src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/altema.jpg`}
                            />
                          </Avatar>
                        </a>
                      )}
                      {dun.aewikiURL && (
                        <a
                          href={dun.aewikiURL}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-transform hover:scale-110 focus:outline-none opacity-90 hover:opacity-100"
                          aria-label="Wiki"
                        >
                          <Avatar className="w-8 h-8 border border-border bg-background shadow-sm">
                            <AvatarImage
                              src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/wiki.jpg`}
                            />
                          </Avatar>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoirInfo;
