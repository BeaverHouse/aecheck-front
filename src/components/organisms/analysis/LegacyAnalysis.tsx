import React, { Suspense } from "react";
import useCheckStore from "../../../store/useCheckStore";
import { getInvenStatus, getNumber } from "../../../util/func";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import Switch from "@mui/material/Switch";
import {
  AECategories,
  AECharacterStyles,
  InvenStatus,
  ModalType,
} from "../../../constants/enum";
import { AEData } from "../../../constants";
import CharacterAvatar from "../../atoms/character/Avatar";
import useModalStore from "../../../store/useModalStore";
import DownloadButton from "../../atoms/button/Download";

const LegacyAnalysis: React.FC<AnalysisProps> = ({ allCharacters }) => {
  const [Opened, setOpened] = React.useState([0, 1, 2, 3]);
  const [WeaponSort, setWeaponSort] = React.useState(false);
  const { setModal } = useModalStore();
  const { inven } = useCheckStore();
  const { t } = useTranslation();

  const baseCharacters = allCharacters
    .concat()
    .filter((char) => getNumber(char) < 1000)
    .sort((a, b) => a.id.localeCompare(b.id));

  /**
   * 1. 없어야 함
   * 2. inven과 클체가능 목록이 겹치는 게 없어야 함
   * 3. 본인 id 앞에 같은 code가 없을 경우만 표시
   */
  const notOwned = baseCharacters.filter(
    (char, idx) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.notOwned &&
      !allCharacters
        .slice(0, idx)
        .map((c) => c.code)
        .includes(char.code)
  );

  const onlyFour = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.owned &&
      char.style === AECharacterStyles.four &&
      allCharacters.filter(
        (c) => c.code === char.code && inven.includes(getNumber(c))
      ).length === 1
  );

  const ccAvailable = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.ccRequired
  );

  const owned = baseCharacters.filter(
    (char) =>
      getInvenStatus(allCharacters, char, inven) === InvenStatus.owned &&
      char.style !== AECharacterStyles.four
  );

  const handleSort = () => setWeaponSort((w) => !w);

  const toggleOpened = (idx: number) => {
    setOpened((opened) =>
      opened.includes(idx) ? opened.filter((o) => o !== idx) : [...opened, idx]
    );
  };

  const CollapseOptions = [
    {
      label: "frontend.analyze.legacy.owned",
      value: owned,
      part: WeaponSort ? AEData.weaponTags : AEData.elementTags,
    },
  ];

  return (
    <Box
      id="ae-wrapper"
      sx={{
        m: 0.5,
        mt: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <Typography variant="subtitle1">
        {t("frontend.analyze.legacy.description")}
      </Typography>
      <DownloadButton tag="ae-wrapper" />
      <Accordion
        expanded={Opened.includes(0)}
        onChange={() => toggleOpened(0)}
        sx={{
          width: "98%",
          maxWidth: "1100px",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t("frontend.analyze.legacy.notowned")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, textAlign: "center" }}>
          {Object.values(AECategories).map((category) => {
            const filtered = notOwned.filter(
              (char) => char.category === category
            );
            return filtered.length > 0 ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: 0.5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {t(`frontend.category.${category.toLowerCase()}`)} (
                  {filtered.length})
                </Typography>
                <Suspense fallback={<CircularProgress sx={{ margin: 10 }} />}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, 75px)",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {filtered.map((c) => (
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
              </>
            ) : null;
          })}
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={Opened.includes(1)}
        onChange={() => toggleOpened(1)}
        sx={{
          width: "98%",
          maxWidth: "1100px",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t("frontend.analyze.legacy.onlyfour")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, textAlign: "center" }}>
          {Object.values(AECategories).map((category) => {
            const filtered = onlyFour.filter(
              (char) => char.category === category
            );
            return filtered.length > 0 ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: 0.5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {t(`frontend.category.${category.toLowerCase()}`)} (
                  {filtered.length})
                </Typography>
                <Suspense fallback={<CircularProgress sx={{ margin: 10 }} />}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, 75px)",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {filtered.map((c) => (
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
              </>
            ) : null;
          })}
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={Opened.includes(2)}
        onChange={() => toggleOpened(2)}
        sx={{
          width: "98%",
          maxWidth: "1100px",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t("frontend.analyze.legacy.classchange")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, textAlign: "center" }}>
          {Object.values(AECharacterStyles).map((style) => {
            if (style === AECharacterStyles.four) return null;
            const filtered = ccAvailable.filter((char) => char.style === style);
            return filtered.length > 0 ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: 0.5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {style} ({filtered.length})
                </Typography>
                <Suspense fallback={<CircularProgress sx={{ margin: 10 }} />}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, 75px)",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {filtered.map((c) => (
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
              </>
            ) : null;
          })}
        </AccordionDetails>
      </Accordion>
      {CollapseOptions.map((opt, idx) =>
        opt.value.length > 0 ? (
          <Accordion
            key={3+idx}
            expanded={Opened.includes(3)}
            onChange={() => toggleOpened(3)}
            sx={{
              width: "98%",
              maxWidth: "1100px",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t(opt.label)}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1, textAlign: "center" }}>
              {opt.label === "frontend.analyze.legacy.owned" ? (
                <Box
                  sx={{
                    m: 2,
                    mt: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {t("frontend.analyze.legacy.sortelement")}
                  <Switch
                    inputProps={{ "aria-label": "Sort Switch" }}
                    color="secondary"
                    checked={WeaponSort}
                    onChange={handleSort}
                  />
                  {t("frontend.analyze.legacy.sortweapon")}
                </Box>
              ) : null}
              {opt.part.map((p) => {
                const filtered = opt.value.filter((val) =>
                  val.personalities.map((v) => v.id).includes(p)
                );
                return filtered.length > 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 2,
                        mb: 0.5,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {p.startsWith("personality") ? (
                        <img
                          src={`${import.meta.env.VITE_CDN_URL}/icon/${p}.png`}
                          alt={p}
                          style={{
                            width: 30,
                            height: 30,
                            marginRight: 10,
                            pointerEvents: "none",
                          }}
                        />
                      ) : null}
                      {t(p)} ({filtered.length})
                    </Typography>
                    <Suspense
                      fallback={<CircularProgress sx={{ margin: 10 }} />}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, 75px)",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        {filtered.map((c) => (
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
                  </>
                ) : null;
              })}
            </AccordionDetails>
          </Accordion>
        ) : null
      )}
    </Box>
  );
};

export default LegacyAnalysis;
