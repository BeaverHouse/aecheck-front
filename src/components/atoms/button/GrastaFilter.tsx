import useFilterStore from "../../../store/useFilterStore";
import ToggleButtonGroup from "../ToggleButtonGroup";

function GrastaFilterButton() {
  const { grastaStatusFilter, setGrastaStatusFilter } = useFilterStore();

  return (
    <div className="flex justify-center m-2">
      <ToggleButtonGroup
        options={[0, 1, 2]}
        value={grastaStatusFilter}
        onChange={setGrastaStatusFilter}
        getLabel={(option) => (
          <img
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/grasta${option}.png`}
            alt={`${option}`}
            width={33}
            height={33}
            className="pointer-events-none"
          />
        )}
        size="icon"
        buttonClassName="p-1"
      />
    </div>
  );
}

export default GrastaFilterButton;
