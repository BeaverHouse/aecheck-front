import useFilterStore from "../../../store/useFilterStore";
import ToggleButtonGroup from "../ToggleButtonGroup";

function StaralignFilterButton() {
  const { staralignStatusFilter, setStaralignStatusFilter } = useFilterStore();

  return (
    <div className="flex justify-center m-2">
      <ToggleButtonGroup
        options={[0, 1, 2, 3]}
        value={staralignStatusFilter}
        onChange={setStaralignStatusFilter}
        getLabel={(option) => `${option}/3`}
      />
    </div>
  );
}

export default StaralignFilterButton;
