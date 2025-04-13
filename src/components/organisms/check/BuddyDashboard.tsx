import { useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import BuddyCard from "../../atoms/BuddyCard";
import { getNumber } from "../../../util/func";
import useCheckStore from "../../../store/useCheckStore";
import useFilterStore from "../../../store/useFilterStore";
import Loading from "../../atoms/Loading";

function BuddyDashboard() {
  const { t } = useTranslation();
  const { buddy, setBuddy } = useCheckStore();
  const { searchWord } = useFilterStore();
  const { isPending, error, data } = useQuery({
    queryKey: ["getBuddies"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/buddy`).then((res) => res.json()),
  });

  if (isPending) return <Loading />;

  if (error) return "An error has occurred: " + error.message;

  const allBuddies = (data as APIResponse<BuddyDetail[]>).data.sort((a, b) =>
    t(a.id).localeCompare(t(b.id))
  );

  const filteredBuddies = allBuddies.filter((b) =>
    t(b.id).toLowerCase().includes(searchWord.toLowerCase())
  );

  const toggleSingleBuddy = (info: BuddyDetail) => {
    if (info.characterID) return;
    const id = getNumber(info);
    if (buddy.includes(id)) {
      setBuddy(buddy.filter((b) => b !== id));
    } else {
      setBuddy([...buddy, id]);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 1,
        overflow: "auto",
      }}
    >
      <Grid container spacing={1} justifyContent="center">
        {filteredBuddies.map((info) => (
          <BuddyCard
            key={info.id}
            info={info}
            onClick={() => toggleSingleBuddy(info)}
          />
        ))}
      </Grid>
    </Box>
  );
}

export default BuddyDashboard;
