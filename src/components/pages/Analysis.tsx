import useConfigStore from "../../store/useConfigStore";
import { AnalysisMenuOptions } from "../../constants/enum";
import StardreamAnalysis from "../organisms/analysis/StardreamAnalysis";
import { useQuery } from "@tanstack/react-query";
import WhiteKeyAnalysis from "../organisms/analysis/WhiteKeyAnalysis";
import LegacyAnalysis from "../organisms/analysis/LegacyAnalysis";
import LegacyTableAnalysis from "../organisms/analysis/LegacyTableAnalysis";
import Loading from "../atoms/Loading";
import { fetchAPI } from "../../util/api";

function AnalysisPage() {
  const { lastAnalysisMenu } = useConfigStore();
  const { isPending, data } = useQuery({
    queryKey: ["getCharacters"],
    queryFn: () => fetchAPI("character"),
    throwOnError: true,
  });

  if (isPending) return <Loading />;

  const allCharacters = (data as APIResponse<CharacterSummary[]>).data;

  const component = () => {
    switch (lastAnalysisMenu) {
      case AnalysisMenuOptions.stardream:
        return <StardreamAnalysis allCharacters={allCharacters} />;
      case AnalysisMenuOptions.whitekey:
        return <WhiteKeyAnalysis allCharacters={allCharacters} />;
      case AnalysisMenuOptions.legacy:
        return <LegacyAnalysis allCharacters={allCharacters} />;
      case AnalysisMenuOptions.legacyTable:
        return <LegacyTableAnalysis allCharacters={allCharacters} />;
    }
  };

  return <div className="flex-grow overflow-auto">{component()}</div>;
}

export default AnalysisPage;
