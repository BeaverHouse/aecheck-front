import { useQuery } from "@tanstack/react-query";
import CharacterDashboard from "../organisms/check/CharacterDashboard";
import ManifestDashboard from "../organisms/check/ManifestDashboard";
import GrastaDashboard from "../organisms/check/GrastaDashboard";
import StaralignDashboard from "../organisms/check/StaralignDashboard";
import useConfigStore from "../../store/useConfigStore";
import BuddyDashboard from "../organisms/check/BuddyDashboard";
import { CheckMenuOptions, CheckTabOptions } from "../../constants/enum";
import GlobalFilter from "../molecules/GlobalFilter";
import { useTranslation } from "react-i18next";
import Loading from "../atoms/Loading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchAPI } from "../../util/api";
import { useCharacterFilter } from "../../hooks/useCharacterFilter";

function CheckPage() {
  const { lastCheckMenu, lastCheckTab, updateLastCheckTab } = useConfigStore();
  const { t } = useTranslation();
  const matchesFilter = useCharacterFilter();
  const { isPending, data } = useQuery({
    queryKey: ["getCharacters", "v2"], // 캐시 무효화
    queryFn: () => fetchAPI("character"),
    throwOnError: true,
    staleTime: 0,
    gcTime: 0,
  });

  if (isPending) return <Loading />;

  const allCharacters = (data as APIResponse<CharacterSummary[]>).data;
  const filteredCharacters = allCharacters.filter(matchesFilter);

  return lastCheckMenu === CheckMenuOptions.characters ? (
    <div className="flex-grow flex flex-col pt-2 bg-background">
      <GlobalFilter type={CheckMenuOptions.characters} />
      <Tabs
        value={lastCheckTab}
        onValueChange={(v) => updateLastCheckTab(v as CheckTabOptions)}
        className="w-full flex-grow flex flex-col"
      >
        <div className="flex justify-center w-full mb-2">
          <TabsList className="inline-flex">
            {Object.values(CheckTabOptions).map((option) => (
              <TabsTrigger key={option} value={option}>
                {t(`frontend.word.${option}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {Object.values(CheckTabOptions).map((option) => (
          <TabsContent key={option} value={option} className="flex-grow">
            {option === CheckTabOptions.inven && (
              <CharacterDashboard {...{ allCharacters, filteredCharacters }} />
            )}
            {option === CheckTabOptions.manifest && (
              <ManifestDashboard {...{ allCharacters, filteredCharacters }} />
            )}
            {option === CheckTabOptions.grasta && (
              <GrastaDashboard {...{ allCharacters, filteredCharacters }} />
            )}
            {option === CheckTabOptions.staralign && (
              <StaralignDashboard {...{ allCharacters, filteredCharacters }} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  ) : (
    <div className="flex-grow flex flex-col pt-2 bg-background">
      <GlobalFilter type={CheckMenuOptions.buddies} />
      <div className="flex-grow overflow-auto">
        <BuddyDashboard />
      </div>
    </div>
  );
}

export default CheckPage;
