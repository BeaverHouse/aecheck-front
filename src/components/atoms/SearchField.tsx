import React from "react";
import { Input } from "@/components/ui/input";
import useFilterStore from "../../store/useFilterStore";

interface SearchBoxInfo {
  label: string;
}

const SearchField: React.FC<SearchBoxInfo> = ({ label }) => {
  const { searchWord, setSearch } = useFilterStore();

  return (
    <Input
      id="search-input"
      type="search"
      value={searchWord}
      onChange={(e) => setSearch(e.target.value)}
      placeholder={label}
      className="h-9"
    />
  );
};

export default SearchField;
