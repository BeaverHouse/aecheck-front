import Container from "@mui/material/Container";
import InvenFilterButton from "../../atoms/button/InvenFilter";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import useCheckStore from "../../../store/useCheckStore";
import { getNumber, getInvenStatus, getShortName } from "../../../util/func";
import {
  AECharacterStyles,
  ModalType,
  PopupOnCheckOptions,
} from "../../../constants/enum";
import CharacterAvatar from "../../atoms/character/Avatar";
import { DashboardWrapperSx, FlexCenter } from "../../../constants/style";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PopupConfigButton from "../../atoms/button/PopupConfig";
import Typography from "@mui/material/Typography";
import useModalStore from "../../../store/useModalStore";
import useConfigStore from "../../../store/useConfigStore";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid2";
import Pagination from "@mui/material/Pagination";
import { useState, useEffect } from "react";

function CharacterDashboard({
  allCharacters,
  filteredCharacters,
}: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { invenStatusFilter } = useFilterStore();
  const { inven, buddy, setInven, setBuddy } = useCheckStore();
  const { popupOnCheck } = useConfigStore();
  const { setModal } = useModalStore();

  const [page, setPage] = useState(1);

  const targetCharacters = filteredCharacters
    .filter(
      (char) =>
        getNumber(char) < 1000 &&
        invenStatusFilter.includes(getInvenStatus(allCharacters, char, inven))
    )
    .sort((a, b) => {
      const aIsRecent = dayjs()
        .subtract(3, "week")
        .isBefore(dayjs(a.updateDate));
      const bIsRecent = dayjs()
        .subtract(3, "week")
        .isBefore(dayjs(b.updateDate));

      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;

      return getShortName(t(a.code), i18n.language).localeCompare(
        getShortName(t(b.code), i18n.language)
      );
    });

  /**
   * 1. Add character
   * 2. Add required 4-star character (if exist)
   * 3. Add buddy
   */
  const addSingleInven = (char: CharacterSummary) => {
    const newCharIds = [...inven, getNumber(char)];

    const fourStarChar = allCharacters.find(
      (c) => c.code === char.code && c.style === AECharacterStyles.four
    );
    if (fourStarChar && char.style === AECharacterStyles.normal) {
      newCharIds.push(getNumber(fourStarChar));
    }

    setInven(newCharIds);

    if (char.buddy) {
      const newBuddyIds = [...buddy, getNumber(char.buddy)];
      setBuddy(newBuddyIds);
    }

    if (
      popupOnCheck === PopupOnCheckOptions.all ||
      (popupOnCheck === PopupOnCheckOptions.fourOnly &&
        char.style === AECharacterStyles.four)
    ) {
      setModal(ModalType.character, char.id);
    }
  };

  /**
   * 1. Remove character
   * 2. Remove normal style if removed character is 4-star
   * 3. Remove buddy
   */
  const removeSingleInven = (char: CharacterSummary) => {
    const removeCharIds = [getNumber(char)];

    const isFourStar = char.style === AECharacterStyles.four;
    const NSChar = allCharacters.find(
      (c) => c.code === char.code && c.style === AECharacterStyles.normal
    );

    if (isFourStar && NSChar) {
      removeCharIds.push(getNumber(NSChar));
    }

    setInven(inven.filter((i) => !removeCharIds.includes(i)));

    if (char.buddy) {
      setBuddy(buddy.filter((b) => b !== getNumber(char.buddy!)));
    }
  };

  const checkAll = () => {
    Swal.fire({
      text: t("frontend.message.character.checkall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const newInven = [
          ...inven,
          ...targetCharacters.map((char) => getNumber(char)),
        ];

        const newCodes = targetCharacters.map((char) => char.code);

        const fourStars = allCharacters.filter(
          (char) =>
            char.style === AECharacterStyles.four &&
            newCodes.includes(char.code)
        );
        for (const char of fourStars) {
          newInven.push(getNumber(char));
        }
        setInven(newInven);

        const newBuddy = [
          ...buddy,
          ...targetCharacters
            .filter((char) => char.buddy)
            .map((char) => getNumber(char.buddy!)),
        ];
        setBuddy(newBuddy);
      }
    });
  };

  const uncheckAll = () => {
    Swal.fire({
      text: t("frontend.message.character.uncheckall"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const removeInven = [
          ...targetCharacters.map((char) => getNumber(char)),
        ];

        const newCodes = targetCharacters.map((char) => char.code);

        const normalStyles = allCharacters.filter(
          (char) =>
            char.style === AECharacterStyles.normal &&
            newCodes.includes(char.code)
        );
        for (const char of normalStyles) {
          removeInven.push(getNumber(char));
        }
        setInven(inven.filter((i) => !removeInven.includes(i)));

        const removeBuddy = [
          ...targetCharacters
            .filter((char) => char.buddy)
            .map((char) => getNumber(char.buddy!)),
        ];
        setBuddy(buddy.filter((b) => !removeBuddy.includes(b)));
      }
    });
  };

  const toggleSingleInven = (char: CharacterSummary) => {
    const id = getNumber(char);
    if (inven.includes(id)) {
      removeSingleInven(char);
    } else {
      addSingleInven(char);
    }
  };

  const getItemsPerPage = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 72; // lg
    if (width >= 900) return 48; // md
    if (width >= 600) return 36; // sm
    return 20; // xs
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(targetCharacters.length / itemsPerPage);

  useEffect(() => {
    const maxPage = Math.ceil(targetCharacters.length / itemsPerPage);
    if (page > maxPage) {
      setPage(maxPage || 1);
    }
  }, [targetCharacters, page, itemsPerPage]);

  const currentCharacters = targetCharacters.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container sx={DashboardWrapperSx}>
      <Box sx={{ ...FlexCenter, flexWrap: "wrap" }}>
        <Typography variant="subtitle1">
          {t("frontend.message.popup-on-check")}
        </Typography>
        <PopupConfigButton />
      </Box>
      <Box sx={{ ...FlexCenter, flexWrap: "wrap" }}>
        <InvenFilterButton />
        <Box>
          <Button
            variant="contained"
            color="secondary"
            sx={{ m: 0.3 }}
            onClick={() => uncheckAll()}
          >
            CLEAR ALL
          </Button>
          <Button
            variant="contained"
            color="success"
            sx={{ m: 0.3 }}
            onClick={() => checkAll()}
          >
            CHECK ALL
          </Button>
        </Box>
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
      <Grid container spacing={1} columns={48} sx={{ width: "100%" }}>
        {currentCharacters.map((char) => (
          <Grid
            size={{ xs: 12, sm: 8, md: 6, lg: 4 }}
            key={`char-${char.id}`}
            display="flex"
            justifyContent="center"
          >
            <CharacterAvatar
              info={char}
              disableShadow={false}
              onClick={() => toggleSingleInven(char)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default CharacterDashboard;
