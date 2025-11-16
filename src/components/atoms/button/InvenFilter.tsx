import { InvenStatus } from "../../../constants/enum";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../../store/useFilterStore";
import ToggleButtonGroup from "../ToggleButtonGroup";

function InvenFilterButton() {
  const { t } = useTranslation();
  const { invenStatusFilter, setInvenStatusFilter } = useFilterStore();

  return (
    <div className="flex justify-center m-2">
      <ToggleButtonGroup
        options={Object.values(InvenStatus)}
        value={invenStatusFilter}
        onChange={setInvenStatusFilter}
        getLabel={(option) => t(`frontend.status.${option}`)}
      />
    </div>
  );
}

export default InvenFilterButton;
