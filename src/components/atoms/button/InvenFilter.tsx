import { InvenStatus } from "../../../constants/enum";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import FilterChip from "../FilterChip";

function InvenFilterButton() {
  const { t } = useTranslation();
  const { invenStatusFilter, setInvenStatusFilter } = useFilterStore();

  return (
    <FilterChip
      title={t("filter.inven")}
      options={Object.values(InvenStatus)}
      value={invenStatusFilter}
      onChange={setInvenStatusFilter}
      getLabel={(option) => t(`frontend.status.${option}`)}
    />
  );
}

export default InvenFilterButton;
