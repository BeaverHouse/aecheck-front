import Container from "@mui/material/Container";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import useCheckStore from "../../../store/useCheckStore";
import {
  getInvenStatus,
  getNumber,
  getShortName,
  getStep,
} from "../../../util/func";
import { DashboardWrapperSx, FlexCenter } from "../../../constants/style";
import CharacterGrasta from "../../molecules/character/Grasta";
import GrastaFilterButton from "../../atoms/button/GrastaFilter";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InvenFilterButton from "../../atoms/button/InvenFilter";
import Swal from "sweetalert2";
import { AECharacterStyles } from "../../../constants/enum";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid2";
import Pagination from "@mui/material/Pagination";
import { useState, useEffect } from "react";

function GrastaDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { inven, grasta, setGrasta } = useCheckStore();
  const { invenStatusFilter, grastaStatusFilter } = useFilterStore();

  const targetCharacters = filteredCharacters
    .filter((char) => char.style !== AECharacterStyles.four && char.dungeons.length > 0)
    .filter(
      (char) =>
        grastaStatusFilter.includes(getStep(getNumber(char), grasta)) &&
        invenStatusFilter.includes(getInvenStatus(allCharacters, char, inven))
    )
    .sort((a, b) => {
      const aIsRecent = dayjs().subtract(3, "week").isBefore(dayjs(a.lastUpdated));
      const bIsRecent = dayjs().subtract(3, "week").isBefore(dayjs(b.lastUpdated));
      
      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;
      
      return getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      );
    });

  const changeAllGrasta = (step: number) => {
    Swal.fire({
      text: t("frontend.message.grasta.changeall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const newGrasta = grasta.filter(
          (m) =>
            !targetCharacters.map((info) => getNumber(info)).includes(m % 10000)
        );
        if (step > 0) {
          newGrasta.push(
            ...targetCharacters.map((char) => step * 10000 + getNumber(char))
          );
        }
        setGrasta(newGrasta);
      }
    });
  };

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filteredCharacters, invenStatusFilter, grastaStatusFilter]);

  const getItemsPerPage = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 24; // lg
    if (width >= 900) return 18; // md
    if (width >= 600) return 12; // sm
    return 6; // xs
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(targetCharacters.length / itemsPerPage);

  const currentCharacters = targetCharacters.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container sx={DashboardWrapperSx}>
      <Box sx={{ ...FlexCenter, flexWrap: "wrap" }}>
        <GrastaFilterButton />
        <InvenFilterButton />
      </Box>
      <Box sx={{ ...FlexCenter, flexWrap: "wrap" }}>
        {[0, 1, 2].map((step) => (
          <Button
            variant="contained"
            color={step === 0 ? "secondary" : "success"}
            sx={{ m: 0.3, pr: 1, pt: 0.5, pb: 0.5 }}
            onClick={() => changeAllGrasta(step)}
            key={step}
          >
            <b>ALL</b>
            <img
              src={`${import.meta.env.VITE_CDN_URL}/icon/grasta${step}.png`}
              alt={`grasta${step}`}
              width={30}
              height={30}
            />
          </Button>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
          size="small"
        />
      </Box>
      <Grid container spacing={1} columns={24} sx={{ width: "100%" }}>
        {currentCharacters.map((char) => (
          <Grid
            size={{ xs: 24, sm: 12, md: 8, lg: 6 }}
            key={`grasta-${char.id}`}
            display="flex"
            justifyContent="center"
          >
            <CharacterGrasta key={`grasta-${char.id}`} {...char} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default GrastaDashboard;
