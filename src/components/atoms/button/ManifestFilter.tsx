import { ManifestStatus } from "../../../constants/enum";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import FilterChip from "../FilterChip";

function ManifestFilterButton() {
  const { t } = useTranslation();
  const { manifestStatusFilter, setManifestStatusFilter } = useFilterStore();

  return (
    <FilterChip
      title={t("filter.manifest")}
      options={Object.values(ManifestStatus)}
      value={manifestStatusFilter}
      onChange={setManifestStatusFilter}
      getLabel={(option) => t(`frontend.status.${option}`)}
    />
  );
}

export default ManifestFilterButton;
