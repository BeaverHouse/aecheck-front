import React from "react";
import useCheckStore from "../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import useModalStore from "../../store/useModalStore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { LanguageOptions, ModalType } from "../../constants/enum";
import { getNumber, isUpdatedInWeeks } from "../../util/func";
import { FlexCenter } from "../../constants/style";

interface BuddyCardProps {
  info: BuddyDetail;
  onClick: () => void;
}

const BuddyCard: React.FC<BuddyCardProps> = ({ info, onClick }) => {
  const { buddy, inven } = useCheckStore();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { setModal } = useModalStore();

  const id = getNumber(info);
  const partnerID = info.characterID
    ? Number(info.characterID.replace("char", ""))
    : -1;
  const isRecent = isUpdatedInWeeks(info.lastUpdated);
  const checked = buddy.includes(id) && inven.includes(partnerID);

  return (
    <Card
      className={isRecent ? "shadow" : ""}
      onClick={onClick}
      sx={{
        ...FlexCenter,
        width: 275,
        height: 80,
        overflow: "unset",
        wordBreak: "keep-all",
      }}
    >
      <ImageListItem
        component={"div"}
        sx={{
          maxHeight: 75,
          minWidth: 75,
          maxWidth: 75,
          position: "relative",
        }}
      >
        <picture>
          <source
            srcSet={`${import.meta.env.VITE_CDN_URL}/buddy/${info.id}.webp`}
            type="image/webp"
          />
          <img
            src={`${import.meta.env.VITE_CDN_URL}/buddy/${info.id}.png`}
            alt={info.id}
            className={checked ? "" : "gray"}
            style={{
              width: 75,
              height: 75,
              pointerEvents: "none",
            }}
          />
        </picture>
        <ImageListItemBar
          subtitle={t(info.id)}
          sx={{
            "& .MuiImageListItemBar-title": {
              display: "none",
            },
            "& .MuiImageListItemBar-subtitle": {
              textAlign: "center",
              fontSize: "12px",
            },
            ".MuiImageListItemBar-titleWrap": {
              padding: 0.5,
            },
          }}
        />
      </ImageListItem>
      <Box
        sx={{
          ml: 1,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {info.characterID ? (
          <picture
            onClick={() => setModal(ModalType.character, info.characterID)}
          >
            <source
              srcSet={`${import.meta.env.VITE_CDN_URL}/character/${
                info.characterID
              }.webp`}
              type="image/webp"
            />
            <img
              src={`${import.meta.env.VITE_CDN_URL}/character/${
                info.characterID
              }.png`}
              className={checked ? "" : "gray"}
              alt={`link_${id}`}
              style={{
                width: 40,
                height: 40,
                pointerEvents: "none",
                border: `1px solid ${theme.palette.grey[400]}`,
              }}
            />
          </picture>
        ) : (
          <Typography variant="subtitle2" sx={{ m: 1 }}>
            {t(info.path!)}
          </Typography>
        )}
      </Box>
      {info.seesaaURL ? (
        <IconButton
          href={
            i18n.language === LanguageOptions.en
              ? info.aewikiURL!
              : info.seesaaURL!
          }
          target="_blank"
          rel="noreferrer"
        >
          <OpenInNewIcon />
        </IconButton>
      ) : null}
    </Card>
  );
};

export default BuddyCard;
