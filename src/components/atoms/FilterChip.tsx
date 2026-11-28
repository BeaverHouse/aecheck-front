import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterChipProps<T> {
  title: string;
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getLabel: (option: T) => string;
}

/** Names the picks, or what is left out when that is shorter, so the chip reads as plain words. */
function summarize(picked: string[], left: string[], t: TFunction) {
  if (left.length === 0) return t("filter.all");
  if (picked.length === 0) return t("filter.none");
  return picked.length <= left.length
    ? picked.join(", ")
    : t("filter.except", { label: left.join(", ") });
}

/** A labelled filter that names what it filters and shows what is picked; its options open in a list. */
function FilterChip<T extends string | number>({
  title,
  options,
  value,
  onChange,
  getLabel,
}: FilterChipProps<T>) {
  const { t } = useTranslation();
  const labelsWhere = (isPicked: boolean) =>
    options
      .filter((option) => value.includes(option) === isPicked)
      .map(getLabel);
  const summary = summarize(labelsWhere(true), labelsWhere(false), t);

  const toggle = (option: T, checked: boolean) =>
    onChange(checked ? [...value, option] : value.filter((v) => v !== option));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 shrink-0 gap-1.5 rounded-full px-3 text-foreground"
        >
          <span className="text-muted-foreground">{title}</span>
          <span className="font-semibold">{summary}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto min-w-48 p-1">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground hover:bg-accent"
          >
            <Checkbox
              checked={value.includes(option)}
              onCheckedChange={(checked) => toggle(option, checked === true)}
            />
            {getLabel(option)}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default FilterChip;
