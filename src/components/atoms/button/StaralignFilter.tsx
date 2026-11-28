import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import FilterChip from "../FilterChip";

function StaralignFilterButton() {
  const { t } = useTranslation();
  const { staralignStatusFilter, setStaralignStatusFilter } = useFilterStore();

  return (
    <FilterChip
      title={t("filter.staralign")}
      options={[0, 1, 2, 3]}
      value={staralignStatusFilter}
      onChange={setStaralignStatusFilter}
      getLabel={(option) =>
        option === 3 ? t("filter.awakened") : t("filter.gauge", { n: option })
      }
    />
  );
}

export default StaralignFilterButton;
