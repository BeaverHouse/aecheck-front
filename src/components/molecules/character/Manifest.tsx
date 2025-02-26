import Card from "@mui/material/Card";
import React from "react";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import useCheckStore from "../../../store/useCheckStore";
import { useTranslation } from "react-i18next";
import { getNumber, getStep, isUpdatedInWeeks } from "../../../util/func";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CharacterAvatar from "../../atoms/character/Avatar";
import { ManifestStatus, ModalType } from "../../../constants/enum";
import { FlexCenter } from "../../../constants/style";
import useModalStore from "../../../store/useModalStore";

interface CharacterManifestProps {
  info: CharacterSummary;
  status: ManifestStatus;
}

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
      <CircularProgress
        variant="determinate"
        color="secondary"
        size={50}
        {...props}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const CharacterManifest: React.FC<CharacterManifestProps> = ({
  info,
  status,
}) => {
  const { manifest, setManifest } = useCheckStore();
  const { setModal } = useModalStore();
  const { t } = useTranslation();

  const id = getNumber(info);
  const currentStep = getStep(id, manifest);
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

  const text = manifestAvailable
    ? t(`frontend.manifest.step${currentStep}`)
    : t(`frontend.manifest.alert.${status}`);

  return (
    <Card
      className={isRecent ? "shadow" : ""}
      sx={{
        display: "flex",
        width: 275,
        overflow: "unset",
        p: 0.5,
      }}
    >
      <CharacterAvatar
        info={info}
        disableShadow={true}
        onClick={() => setModal(ModalType.character, info.id)}
      />
      {manifestAvailable ? (
        <Box sx={{ display: "flex", alignItems: "center", pl: 1, pr: 1 }}>
          <CircularProgressWithLabel
            value={(100 * currentStep) / info.maxManifest}
          />
          <Box>
            <ToggleButtonGroup
              exclusive
              onChange={(_, value) => changeManifest(value)}
              aria-label="text alignment"
              sx={{ height: 25, mb: 1 }}
            >
              <ToggleButton value={-1}>
                <RemoveIcon />
              </ToggleButton>
              <ToggleButton value={1}>
                <AddIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography fontWeight={600}>{text}</Typography>
          </Box>
        </Box>
      ) : (
        <Typography
          sx={{ ...FlexCenter, textAlign: "center", flex: 1 }}
          variant="subtitle2"
        >
          {text}
        </Typography>
      )}
    </Card>
  );
};

export default CharacterManifest;
