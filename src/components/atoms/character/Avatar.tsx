import React from "react";
import useCheckStore from "../../../store/useCheckStore";
import useConfigStore from "../../../store/useConfigStore";
import { useTranslation } from "react-i18next";
import { getNumber, getShortName, getStep, isUpdatedInWeeks } from "../../../util/func";
import { AECharacterStyles } from "../../../constants/enum";
import { cn } from "@/lib/utils";

interface CharacterCheckProps {
  info: CharacterSummary;
  disableShadow: boolean;
  disableGray?: boolean;
  disableTierRing?: boolean;
  onClick: () => void;
}

// 캐릭터 체크 UI
const CharacterAvatar: React.FC<CharacterCheckProps> = ({
  info,
  disableShadow,
  disableGray = false,
  disableTierRing = false,
  onClick,
}) => {
  const { inven, grasta, manifest, staralign, weaponTempering } = useCheckStore();
  const { showTierBadge } = useConfigStore();
  const { t, i18n } = useTranslation();

  const id = getNumber(info);
  const checked = inven.includes(id);
  const isRecent = isUpdatedInWeeks(info.updateDate);
  const hasTierRing = !disableTierRing && showTierBadge && (info.tier === "op" || info.tier === "super_op");

  const currentGrastaStep = getStep(id, grasta);
  const currentManifestStep = getStep(id, manifest);
  const currentAlignStep = getStep(id, staralign);
  const currentWeaponTemperingStep = getStep(id, weaponTempering);

  const manifestIcon = () => {
    if (info.customManifest && currentWeaponTemperingStep > 0) return null;
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

    return (
      <div className="absolute bottom-[-8px] left-[-5px] z-10">
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
      className={cn(
        "w-[75px] h-[75px] cursor-pointer relative rounded-[3px]",
        hasTierRing && info.tier === "op" && "ring-2 ring-yellow-500/80",
        hasTierRing && info.tier === "super_op" && "ring-4 ring-yellow-400",
        !hasTierRing && isRecent && !disableShadow && "ring-2 ring-[#56b4e9]"
      )}
    >
      {styleIcon()}
      {grastaIcon()}
      {manifestIcon()}
      {weaponTemperingIcon()}
      <picture
        className="block w-full h-full rounded-[3px]"
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
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1 leading-tight truncate px-0.5">
        {getShortName(t(info.code), i18n.language)}
      </div>
    </div>
  );
};

export default CharacterAvatar;
