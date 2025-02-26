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
import { FlexCenter } from "../../../constants/style";
import useModalStore from "../../../store/useModalStore";
import { ModalType } from "../../../constants/enum";

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
      {inven.includes(id) ? (
        <Box sx={{ display: "flex", alignItems: "center", pl: 1, pr: 1 }}>
          <CircularProgressWithLabel value={(100 * currentStep) / 3} />
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
          </Box>
        </Box>
      ) : (
        <Typography
          sx={{ ...FlexCenter, textAlign: "center", flex: 1 }}
          variant="subtitle2"
        >
          {t(`frontend.status.not-owned`)}
        </Typography>
      )}
    </Card>
  );
};

export default CharacterStaralign;
