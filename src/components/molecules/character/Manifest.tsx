import React from "react";
import useCheckStore from "../../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import { getNumber, getStep, isUpdatedInWeeks } from "../../../util/func";
import { Plus, Minus } from "lucide-react";
import CharacterAvatar from "../../atoms/character/Avatar";
import { ManifestStatus, ModalType } from "../../../constants/enum";
import useModalStore from "../../../store/useModalStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CharacterManifestProps {
  info: CharacterSummary;
  status: ManifestStatus;
}

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

const CharacterManifest: React.FC<CharacterManifestProps> = ({
  info,
  status,
}) => {
  const { manifest, setManifest, weaponTempering, setWeaponTempering } = useCheckStore();
  const { setModal } = useModalStore();
  const { t } = useTranslation();

  const id = getNumber(info);
  const currentStep = getStep(id, manifest);
  const weaponTemperingStep = getStep(id, weaponTempering);
  const manifestAvailable =
    status === ManifestStatus.incompleted ||
    status === ManifestStatus.completed;
  const isRecent = isUpdatedInWeeks(info.lastUpdated);

  const changeManifest = (step: number) => {
    const changedStep = currentStep + step;
    if (changedStep < 0 || changedStep > info.maxManifest) return;
    const changedManifest = changedStep * 10000 + id;
    const newState = [
      ...manifest.filter((x) => x % 10000 !== id),
      changedManifest,
    ].filter((x) => x >= 10000 && x < 30000);

    setManifest(newState);
  };

  const toggleWeaponTempering = () => {
    const newStep = weaponTemperingStep === 0 ? 1 : 0;
    const encoded = newStep * 10000 + id;
    const newState = [
      ...weaponTempering.filter((x) => x % 10000 !== id),
      encoded,
    ].filter((x) => x >= 10000 && x < 20000);

    setWeaponTempering(newState);
  };

  const text = manifestAvailable
    ? t(`frontend.manifest.step${currentStep}`)
    : t(`frontend.manifest.alert.${status}`);

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
        {manifestAvailable ? (
          <div className="flex items-center justify-center flex-1 gap-4">
            <CircularProgressWithLabel
              value={(100 * currentStep) / info.maxManifest}
            />
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
              <p className="font-semibold text-sm text-center whitespace-nowrap">{text}</p>
              {info.customManifest && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`weapon-tempering-${id}`}
                    checked={weaponTemperingStep === 1}
                    onCheckedChange={toggleWeaponTempering}
                    disabled={currentStep < info.maxManifest || info.maxManifest === 0}
                  />
                  <label
                    htmlFor={`weapon-tempering-${id}`}
                    className="text-xs cursor-pointer whitespace-nowrap"
                  >
                    {t("frontend.manifest.weaponTempering")}
                  </label>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="flex items-center justify-center text-center flex-1 text-sm px-2">
            {text}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterManifest;
