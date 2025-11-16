import useConfigStore from "../../store/useConfigStore";
import { CheckMenuOptions } from "../../constants/enum";
import CharacterSearch from "../organisms/search/CharacterSearch";
import BuddySearch from "../organisms/search/BuddySearch";

function SearchPage() {
  const { lastSearchMenu } = useConfigStore();

  return (
    <div className="flex-grow overflow-auto">
      {lastSearchMenu === CheckMenuOptions.characters ? (
        <CharacterSearch />
      ) : (
        <BuddySearch />
      )}
    </div>
  );
}

export default SearchPage;
