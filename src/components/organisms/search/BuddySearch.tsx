import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import BuddyCard from "../../atoms/BuddyCard";
import useFilterStore from "../../../store/useFilterStore";
import GlobalFilter from "../../molecules/GlobalFilter";
import { CheckMenuOptions } from "../../../constants/enum";
import Loading from "../../atoms/Loading";
import { fetchAPI } from "../../../util/api";

function BuddySearch() {
  const { t } = useTranslation();
  const { searchWord } = useFilterStore();
  const { isPending, data } = useQuery({
    queryKey: ["getBuddies"],
    queryFn: () => fetchAPI("buddy"),
    throwOnError: true,
  });

  if (isPending) return <Loading />;

  const allBuddies = (data as APIResponse<BuddyDetail[]>).data.sort((a, b) =>
    t(a.id).localeCompare(t(b.id))
  );

  const filteredBuddies = allBuddies.filter((b) =>
    t(b.id).toLowerCase().includes(searchWord.toLowerCase())
  );

  return (
    <div className="flex-grow pt-6">
      <GlobalFilter type={CheckMenuOptions.buddies} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,400px))] gap-4 justify-center p-4">
        {filteredBuddies.map((info) => (
          <BuddyCard key={info.id} info={info} />
        ))}
      </div>
    </div>
  );
}

export default BuddySearch;
