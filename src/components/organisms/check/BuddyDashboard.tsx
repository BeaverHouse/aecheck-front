import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import BuddyCard from "../../atoms/BuddyCard";
import { getNumber } from "../../../util/func";
import useCheckStore from "../../../store/useCheckStore";
import useFilterStore from "../../../store/useFilterStore";
import Loading from "../../atoms/Loading";
import { fetchAPI } from "../../../util/api";

function BuddyDashboard() {
  const { t } = useTranslation();
  const { buddy, setBuddy } = useCheckStore();
  const { searchWord } = useFilterStore();
  const { isPending, error, data } = useQuery({
    queryKey: ["getBuddies"],
    queryFn: () => fetchAPI("buddy"),
    throwOnError: true,
  });

  if (isPending) return <Loading />;

  if (error) return <div className="text-destructive">An error has occurred: {error.message}</div>;

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
    <div className="flex-grow px-4 py-2 overflow-auto">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,400px))] gap-4 justify-center">
        {filteredBuddies.map((info) => (
          <BuddyCard
            key={info.id}
            info={info}
            onClick={() => toggleSingleBuddy(info)}
          />
        ))}
      </div>
    </div>
  );
}

export default BuddyDashboard;
