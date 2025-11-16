import { ManifestStatus } from "../../../constants/enum";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import ToggleButtonGroup from "../ToggleButtonGroup";

function ManifestFilterButton() {
  const { t } = useTranslation();
  const { manifestStatusFilter, setManifestStatusFilter } = useFilterStore();

  return (
    <div className="flex justify-center m-2">
      <ToggleButtonGroup
        options={Object.values(ManifestStatus)}
        value={manifestStatusFilter}
        onChange={setManifestStatusFilter}
        getLabel={(option) => t(`frontend.status.${option}`)}
      />
    </div>
  );
}

export default ManifestFilterButton;
