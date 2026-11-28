import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import FilterChip from "../FilterChip";

function GrastaFilterButton() {
  const { t } = useTranslation();
  const { grastaStatusFilter, setGrastaStatusFilter } = useFilterStore();

  return (
    <FilterChip
      title={t("filter.grasta")}
      options={[0, 1, 2]}
      value={grastaStatusFilter}
      onChange={setGrastaStatusFilter}
      getLabel={(option) => t(`grasta.${option}`)}
    />
  );
}

export default GrastaFilterButton;
