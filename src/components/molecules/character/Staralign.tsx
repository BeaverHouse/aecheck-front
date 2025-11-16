import React from "react";
import useCheckStore from "../../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import { getNumber, getStep, isUpdatedInWeeks } from "../../../util/func";
import { Plus, Minus } from "lucide-react";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import { ModalType } from "../../../constants/enum";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CircularProgressWithLabel({ value }: { value: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex">
      <svg width="70" height="70" className="transform -rotate-90">
        <circle
          cx="35"
          cy="35"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="35"
          cy="35"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-secondary-foreground transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-muted-foreground">{`${Math.round(value)}%`}</span>
      </div>
    </div>
  );
}

const CharacterStaralign: React.FC<CharacterSummary> = (info) => {
  const { inven, staralign, setStaralign } = useCheckStore();
  const { setModal } = useModalStore();
  const { t } = useTranslation();

  const id = getNumber(info);
  const currentStep = getStep(id, staralign);
  const isRecent = isUpdatedInWeeks(info.lastUpdated);

  const changeManifest = (step: number) => {
    const changedStep = currentStep + step;
    if (changedStep < 0 || changedStep > 3) return;
    const changedStaralign = changedStep * 10000 + id;
    const newState = [
      ...staralign.filter((x) => x % 10000 !== id),
      changedStaralign,
    ].filter((x) => x >= 10000 && x < 40000);

    setStaralign(newState);
  };

  return (
    <Card
      className={cn(
        "flex w-full min-w-[275px] overflow-visible",
        isRecent && "shadow"
      )}
    >
      <CardContent className="flex items-center p-2 w-full">
        <CharacterAvatar
          info={info}
          disableShadow={true}
          onClick={() => setModal(ModalType.character, info.id)}
        />
        {inven.includes(id) ? (
          <div className="flex items-center justify-center flex-1 gap-4">
            <CircularProgressWithLabel value={(100 * currentStep) / 3} />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => changeManifest(-1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => changeManifest(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="flex items-center justify-center text-center flex-1 text-sm px-2">
            {t(`frontend.status.not-owned`)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterStaralign;
