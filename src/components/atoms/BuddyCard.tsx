import React from "react";
import useCheckStore from "../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import useModalStore from "../../store/useModalStore";
import { ExternalLink } from "lucide-react";
import { LanguageOptions, ModalType } from "../../constants/enum";
import { getNumber, isUpdatedInWeeks } from "../../util/func";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuddyCardProps {
  info: BuddyDetail;
  onClick: () => void;
}

const BuddyCard: React.FC<BuddyCardProps> = ({ info, onClick }) => {
  const { buddy, inven } = useCheckStore();
  const { t, i18n } = useTranslation();
  const { setModal } = useModalStore();

  const id = getNumber(info);
  const partnerID = info.characterID
    ? Number(info.characterID.replace("char", ""))
    : -1;
  const isRecent = isUpdatedInWeeks(info.lastUpdated);
  const checked =
    buddy.includes(id) && (partnerID === -1 || inven.includes(partnerID));

  return (
    <Card
      className={cn(
        "w-full min-w-[275px] max-w-[400px] h-[80px] cursor-pointer hover:bg-accent/50 transition-colors",
        isRecent && "shadow"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center p-0 h-full overflow-visible w-full">
        <div className="relative min-w-[75px] max-w-[75px] h-[75px]">
          <picture>
            <source
              srcSet={`${process.env.NEXT_PUBLIC_CDN_URL}/buddy/${info.id}.webp`}
              type="image/webp"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/buddy/${info.id}.png`}
              alt={info.id}
              className={cn("w-[75px] h-[75px] pointer-events-none", !checked && "gray")}
            />
          </picture>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1">
            {t(info.id)}
          </div>
        </div>

        <div className="ml-2 flex-grow flex items-center justify-center">
          {info.characterID ? (
            <picture
              onClick={(e) => {
                e.stopPropagation();
                setModal(ModalType.character, info.characterID);
              }}
              className="cursor-pointer"
            >
              <source
                srcSet={`${process.env.NEXT_PUBLIC_CDN_URL}/character/${info.characterID}.webp`}
                type="image/webp"
              />
              <img
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/character/${info.characterID}.png`}
                className={cn(
                  "w-[40px] h-[40px] pointer-events-none border border-border",
                  !checked && "gray"
                )}
                alt={`link_${id}`}
              />
            </picture>
          ) : (
            <p className="text-sm mx-2 text-center">{t(info.path!)}</p>
          )}
        </div>

        {info.seesaaURL && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={
                i18n.language === LanguageOptions.en
                  ? info.aewikiURL!
                  : info.seesaaURL!
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BuddyCard;
