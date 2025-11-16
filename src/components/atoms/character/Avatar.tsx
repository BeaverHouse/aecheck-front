import React from "react";
import useCheckStore from "../../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import { getNumber, getShortName, getStep, isUpdatedInWeeks } from "../../../util/func";
import { AECharacterStyles } from "../../../constants/enum";
import { cn } from "@/lib/utils";

interface CharacterCheckProps {
  info: CharacterSummary;
  disableShadow: boolean;
  disableGray?: boolean;
  onClick: () => void;
}

// 캐릭터 체크 UI
const CharacterAvatar: React.FC<CharacterCheckProps> = ({
  info,
  disableShadow,
  disableGray = false,
  onClick,
}) => {
  const { inven, grasta, manifest, staralign, weaponTempering } = useCheckStore();
  const { t, i18n } = useTranslation();

  const id = getNumber(info);
  const checked = inven.includes(id);
  const isRecent = isUpdatedInWeeks(info.updateDate);

  const currentGrastaStep = getStep(id, grasta);
  const currentManifestStep = getStep(id, manifest);
  const currentAlignStep = getStep(id, staralign);
  const currentWeaponTemperingStep = getStep(id, weaponTempering);

  const manifestIcon = () => {
    const manifestCompleted =
      currentManifestStep >= info.maxManifest && info.maxManifest > 0;
    if (manifestCompleted) {
      return (
        <div className="absolute bottom-[-8px] left-[-5px] z-10">
          <div className="relative w-[23px] h-[23px] bg-black/60 rounded-full flex items-center justify-center">
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/crown.png`}
              alt="complete"
              className="w-[18px] h-[18px]"
            />
          </div>
        </div>
      );
    }
  };

  const styleIcon = () => {
    if (info.style === AECharacterStyles.four) return null;
    return (
      <img
        src={`${
          process.env.NEXT_PUBLIC_CDN_URL
        }/icon/${info.style.toLowerCase()}.png`}
        alt={info.style}
        className="absolute top-[-7px] left-[-7px] z-10 w-[27px] h-[27px]"
      />
    );
  };

  const grastaIcon = () => {
    if (currentGrastaStep === 0) return null;
    return (
      <img
        src={`${
          process.env.NEXT_PUBLIC_CDN_URL
        }/icon/grasta${currentGrastaStep}.png`}
        alt={`grasta${currentGrastaStep}`}
        className="absolute top-[-11px] right-[-11px] z-10 w-[33px] h-[33px]"
      />
    );
  };

  const weaponTemperingIcon = () => {
    if (!info.customManifest || currentWeaponTemperingStep === 0) return null;

    // 크라운 완료 여부 확인
    const manifestCompleted = currentManifestStep >= info.maxManifest && info.maxManifest > 0;
    const bottomPosition = manifestCompleted ? "bottom-[12px]" : "bottom-[-8px]";

    return (
      <div className={`absolute ${bottomPosition} left-[-5px] z-10`}>
        <div className="relative w-[23px] h-[23px] bg-black/60 rounded-full flex items-center justify-center">
          <img
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/weapontempering.png`}
            alt="weapon tempering"
            className="w-[18px] h-[18px]"
          />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="w-[75px] h-[75px] cursor-pointer relative"
    >
      {styleIcon()}
      {grastaIcon()}
      {manifestIcon()}
      {weaponTemperingIcon()}
      <picture
        className={cn(
          "block w-full h-full rounded-[3px]",
          isRecent && !disableShadow && "shadow-[0_0_12px_4px_rgba(0,150,255,0.6)]"
        )}
      >
        {currentAlignStep === 3 && inven.includes(id) ? (
          <>
            <source
              srcSet={`${process.env.NEXT_PUBLIC_CDN_URL}/staralign/${info.id}.webp`}
              type="image/webp"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/staralign/${info.id}.png`}
              alt={info.id}
              className={cn(
                "w-[105px] h-[105px] rounded-[3px] pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover",
                !(checked || disableGray) && "grayscale opacity-50"
              )}
            />
          </>
        ) : (
          <>
            <source
              srcSet={`${process.env.NEXT_PUBLIC_CDN_URL}/character/${info.id}.webp`}
              type="image/webp"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/character/${info.id}.png`}
              alt={info.id}
              className={cn(
                "w-full h-full rounded-[3px] pointer-events-none",
                !(checked || disableGray) && "grayscale opacity-50"
              )}
            />
          </>
        )}
      </picture>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1 leading-tight">
        {getShortName(t(info.code), i18n.language)}
      </div>
    </div>
  );
};

export default CharacterAvatar;
