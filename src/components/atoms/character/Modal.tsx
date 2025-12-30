import React from "react";
import { useTranslation } from "react-i18next";
import useModalStore from "../../../store/useModalStore";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { getInvenStatus, getStep } from "../../../util/func";
import useCheckStore from "../../../store/useCheckStore";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { InvenStatus, LanguageOptions } from "../../../constants/enum";
import { getNumber } from "../../../util/func";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { fetchAPI } from "../../../util/api";
import Loading from "../Loading";
import MemoirInfo from "./MemoirInfo";

const CharacterModal: React.FC = () => {
  const { inven, grasta, manifest, staralign, weaponTempering } =
    useCheckStore();
  const { characterID, hideModal } = useModalStore();
  const { t, i18n } = useTranslation();

  const characterDetailQuery = useQuery({
    queryKey: ["getCharacterDetail", characterID],
    queryFn: () => fetchAPI(`character/${characterID}`),
    throwOnError: true,
  });

  const relatedCharacterQuery = useQuery({
    queryKey: ["getRelatedCharacter", characterID],
    queryFn: () => fetchAPI(`character/related/${characterID}`),
    throwOnError: true,
  });

  if (characterDetailQuery.isError) {
    return (
      <Dialog open={true} onOpenChange={hideModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-destructive">
            An error has occurred: {characterDetailQuery.error.message}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (relatedCharacterQuery.isError) {
    return (
      <Dialog open={true} onOpenChange={hideModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-destructive">
            An error has occurred: {relatedCharacterQuery.error.message}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (characterDetailQuery.isPending || relatedCharacterQuery.isPending) {
    return (
      <Dialog open={true} onOpenChange={hideModal}>
        <DialogContent className="max-w-[400px] w-[95%]">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <Loading />
        </DialogContent>
      </Dialog>
    );
  }

  const characterData = (
    characterDetailQuery.data as APIResponse<CharacterDetail>
  ).data;
  const relatedCharacters = (
    relatedCharacterQuery.data as APIResponse<CharacterSummary[]>
  ).data;

  const id = getNumber(characterData);

  const manifestTag = `frontend.manifest.step${characterData.maxManifest}`;

  const currentInven = getInvenStatus(relatedCharacters, characterData, inven);
  const currentGrastaStep = getStep(id, grasta);
  const currentManifestStep = getStep(id, manifest);
  const currentAlignStep = getStep(id, staralign);
  const currentWeaponTemperingStep = getStep(id, weaponTempering);

  const invenIcon = () => {
    switch (currentInven) {
      case InvenStatus.owned:
        return <CheckCircle className="w-7 h-7 text-green-500 mr-2" />;
      case InvenStatus.ccRequired:
        return <AlertCircle className="w-7 h-7 text-yellow-500 mr-2" />;
      case InvenStatus.notOwned:
        return <XCircle className="w-7 h-7 text-red-500 mr-2" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={hideModal}>
      <DialogContent className="max-w-[400px] w-[95%] max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center gap-2">
            <span>
              {t(characterData.code)} ({characterData.style})
            </span>
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/type-${characterData.lightShadow}.png`}
              alt={characterData.lightShadow}
              className="w-[30px] h-[30px] pointer-events-none"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="flex w-full items-center mb-6">
          <picture>
            <source
              srcSet={`${process.env.NEXT_PUBLIC_CDN_URL}/character/${characterData.id}.webp`}
              type="image/webp"
            />
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/character/${characterData.id}.png`}
              alt={characterData.id}
              className="w-[75px] h-[75px] pointer-events-none"
            />
          </picture>
          <div className="flex-grow pl-4">
            <p className="text-sm font-medium text-foreground">
              Release: {dayjs(characterData.updateDate).format("YYYY-MM-DD")}
            </p>
          </div>
          {characterData.seesaaURL && (
            <a
              href={
                i18n.language === LanguageOptions.en
                  ? characterData.aewikiURL
                  : characterData.seesaaURL
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="w-5 h-5 text-foreground" />
            </a>
          )}
        </div>

        {id < 1000 && (
          <div className="flex w-full items-center mb-2">
            {invenIcon()}
            <p className="text-sm font-medium text-foreground">
              {t(`frontend.status.${currentInven}`)}
            </p>
          </div>
        )}

        {currentManifestStep === characterData.maxManifest &&
          characterData.maxManifest > 0 && (
            <div className="flex w-full items-center">
              <img
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/crown.png`}
                alt="complete"
                className="w-7 h-7 mr-2"
              />
              <p className="text-sm font-medium text-foreground">
                {t(manifestTag!)} Complete
              </p>
            </div>
          )}

        {characterData.customManifest && currentWeaponTemperingStep === 1 && (
          <div className="flex w-full items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/weapontempering.png`}
              alt="weapon tempering complete"
              className="w-7 h-7 mr-2"
            />
            <p className="text-sm font-medium text-foreground">
              {t("frontend.manifest.weaponTempering")} Complete
            </p>
          </div>
        )}

        {currentAlignStep === 3 && inven.includes(id) && (
          <div className="flex w-full items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/staralign/${characterData.id}.png`}
              alt="complete"
              className="w-7 h-7 mr-2"
            />
            <p className="text-sm font-medium text-foreground">
              {t("frontend.word.staralign")} Complete
            </p>
          </div>
        )}

        <div className="flex w-full items-center justify-center flex-col sm:flex-row mb-2 mt-4">
          <p className="text-sm font-medium text-foreground m-1">
            {t(`frontend.word.element`)}
          </p>
          <div className="flex-grow m-1 text-center">
            {Array.isArray(characterData.personalityIds) &&
              characterData.personalityIds
                .filter((id) => id.startsWith("personality00"))
                .map((id) => (
                  <img
                    key={id}
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${id}.png`}
                    alt={id}
                    className="inline w-[30px] h-[30px] pointer-events-none"
                  />
                ))}
          </div>
          <p className="text-sm font-medium text-foreground m-1">
            {t(`frontend.word.weapon`)}
          </p>
          <div className="flex-grow m-1 text-center">
            {Array.isArray(characterData.personalityIds) &&
              characterData.personalityIds
                .filter((id) => id.startsWith("personality01"))
                .map((id) => (
                  <img
                    key={id}
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${id}.png`}
                    alt={id}
                    className="inline w-[30px] h-[30px] pointer-events-none"
                  />
                ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-center flex-col sm:flex-row mb-2">
          <p className="text-sm font-medium text-foreground m-1 break-keep">
            {t(`frontend.word.personality`)}
          </p>
          <div className="flex-grow text-center">
            {Array.isArray(characterData.personalityIds) &&
              characterData.personalityIds
                .filter((id) => !id.endsWith("000"))
                .map((id) => (
                  <Badge key={id} variant="secondary" className="m-0.5">
                    {t(id)}
                  </Badge>
                ))}
          </div>
        </div>

        {characterData.buddy && (
          <div className="flex w-full items-center justify-center flex-col sm:flex-row mb-4 mt-4 break-keep">
            <p className="text-sm font-medium text-foreground m-1">
              {t(`frontend.word.buddy`)}
            </p>
            <div className="flex-grow text-center">
              <picture>
                <source
                  srcSet={`${process.env.NEXT_PUBLIC_CDN_URL}/buddy/${characterData.buddy.id}.webp`}
                  type="image/webp"
                />
                <img
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/buddy/${characterData.buddy.id}.png`}
                  alt={characterData.buddy.id}
                  className="w-[50px] h-[50px] border border-border rounded-[5px] pointer-events-none inline-block"
                />
              </picture>
              <p className="text-sm font-medium text-foreground">
                {t(characterData.buddy.id)}
              </p>
            </div>
          </div>
        )}

        <MemoirInfo
          characterData={characterData}
          currentGrastaStep={currentGrastaStep}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CharacterModal;
