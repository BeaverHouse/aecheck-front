import React, { Suspense } from "react";
import useCheckStore from "../../../store/useCheckStore";
import { getInvenStatus, getShortName } from "../../../util/func";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  AECategories,
  AECharacterStyles,
  InvenStatus,
  ModalType,
} from "../../../constants/enum";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import DownloadButton from "../../atoms/button/Download";

const WhiteKeyAnalysis: React.FC<AnalysisProps> = ({ allCharacters }) => {
  const [Opened, setOpened] = React.useState([0, 1, 2, 3, 4]);
  const [ShowNotOwned, setShowNotOwned] = React.useState(false);
  const { setModal } = useModalStore();
  const { inven } = useCheckStore();
  const { t, i18n } = useTranslation();

  const baseCharacters = allCharacters
    .concat()
    .filter(
      (char) =>
        char.category === AECategories.encounter &&
        (char.style === AECharacterStyles.extra ||
          char.style === AECharacterStyles.another ||
          char.isAlter)
    )
    .sort((a, b) =>
      getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      )
    );

  const firstOptions = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.ccRequired
  );
  const secondOptions = baseCharacters.filter(
    (char) => getInvenStatus(allCharacters, char, inven) !== InvenStatus.owned
  );
  const targetOptions = ShowNotOwned ? secondOptions : firstOptions;

  const toggleOpened = (idx: number) => {
    setOpened((opened) =>
      opened.includes(idx) ? opened.filter((o) => o !== idx) : [...opened, idx]
    );
  };

  const CollapseOptions = [
    {
      label: "frontend.analyze.oneyear",
      value: targetOptions.filter((info) =>
        dayjs().subtract(1, "year").isBefore(dayjs(info.updateDate!))
      ),
    },
    // {
    //     label: "frontend.analyze.havebuddy",
    //     value: targetOptions.filter((info) => buddyCharacterIds.includes(info.id)),
    // },
    {
      label: "alter.true",
      value: targetOptions.filter((char) => char.isAlter),
    },
    {
      label: "frontend.analyze.extra",
      value: targetOptions.filter(
        (char) => char.style === AECharacterStyles.extra
      ),
    },
    {
      label: "frontend.analyze.another",
      value: targetOptions.filter(
        (char) => char.style === AECharacterStyles.another
      ),
    },
  ];

  return (
    <Box
      id="ae-wrapper"
      sx={{
        m: 0.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="subtitle1" sx={{ m: 1 }}>
        {t("frontend.analyze.whitekey.description")}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <DownloadButton tag="ae-wrapper" />
        <FormGroup sx={{ ml: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                color="secondary"
                checked={ShowNotOwned}
                onChange={(_, checked) => setShowNotOwned(checked)}
              />
            }
            label={
              <Typography variant="subtitle2">
                {t("frontend.analyze.whitekey.option")}
              </Typography>
            }
          />
        </FormGroup>
      </Box>
      {targetOptions.length > 0 ? (
        CollapseOptions.map((opt, idx) =>
          opt.value.length > 0 ? (
            <Accordion
              key={idx}
              expanded={Opened.includes(idx)}
              onChange={() => toggleOpened(idx)}
              sx={{
                width: "98%",
                maxWidth: "1100px",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t(opt.label)}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1 }}>
                <Suspense fallback={<CircularProgress sx={{ margin: 10 }} />}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, 75px)",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {opt.value.map((c) => (
                      <CharacterAvatar
                        key={c.id}
                        info={c}
                        disableShadow={false}
                        disableGray={true}
                        onClick={() => setModal(ModalType.character, c.id)}
                      />
                    ))}
                  </Box>
                </Suspense>
              </AccordionDetails>
            </Accordion>
          ) : null
        )
      ) : (
        <>
          <img src="/happy.png" alt="empty" />
          <Typography variant="h6" sx={{ m: 1 }}>
            {t("frontend.analyze.whitekey.empty")}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default WhiteKeyAnalysis;
