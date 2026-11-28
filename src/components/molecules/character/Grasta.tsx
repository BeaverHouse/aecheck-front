import React from "react";
import useCheckStore from "../../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import { getNumber, getStep, isUpdatedInWeeks } from "../../../util/func";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import useConfigStore from "../../../store/useConfigStore";
import { ModalType } from "../../../constants/enum";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CharacterGrasta: React.FC<CharacterSummary> = (info) => {
  const { grasta, setGrasta } = useCheckStore();
  const setModal = useModalStore((state) => state.setModal);
  const { showTierBadge } = useConfigStore();
  const { t } = useTranslation();

  const id = getNumber(info);
  const isRecent = isUpdatedInWeeks(info.lastUpdated);
  const hasTier =
    showTierBadge && (info.tier === "op" || info.tier === "super_op");
  const currentStep = getStep(id, grasta);

  const changeGrasta = (step: number) => {
    const changedGrasta = step * 10000 + id;
    const newState = [
      ...grasta.filter((x) => x % 10000 !== id),
      changedGrasta,
    ].filter((x) => x >= 10000 && x < 30000);

    setGrasta(newState);
  };

  return (
    <Card
      className={cn(
        "flex w-full min-w-[275px] overflow-visible",
        hasTier && info.tier === "op" && "glow-op",
        hasTier && info.tier === "super_op" && "glow-super-op",
        !hasTier && isRecent && "glow-recent",
      )}
    >
      <CardContent className="flex p-2 w-full">
        <CharacterAvatar
          info={info}
          disableShadow={true}
          disableTierRing={true}
          onClick={() => setModal(ModalType.character, info.id)}
        />
        <div className="flex flex-col flex-1 items-center justify-center">
          <p className="mb-1 text-sm font-bold">{t(`book.${info.id}`)}</p>
          <div className="flex w-full flex-col gap-1 pl-2">
            {[0, 1, 2].map((step) => (
              <Button
                key={step}
                variant={currentStep === step ? "default" : "outline"}
                size="sm"
                aria-pressed={currentStep === step}
                className="h-8 justify-start text-xs"
                onClick={() => changeGrasta(step)}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/grasta${step}.png`}
                  alt=""
                  width={20}
                  height={20}
                />
                {t(`grasta.${step}`)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterGrasta;
