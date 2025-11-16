import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../store/useFilterStore";
import PersonalitySelect from "../atoms/PersonalitySelect";
import ToggleButtonGroup from "../atoms/ToggleButtonGroup";
import useModalStore from "../../store/useModalStore";
import {
  AEAlterStatus,
  AEAwakenStatus,
  AECategories,
  AECharacterStyles,
  AELightShadow,
  AEManifestLevels,
  GrastaWeaponTemperingFilter,
} from "../../constants/enum";
import { useQuery } from "@tanstack/react-query";
import Loading from "./Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAPI } from "../../util/api";

interface ToggleGroupProps<T> {
  label: string;
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getLabel: (option: T) => string;
}

function ToggleGroup<T extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
  getLabel,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex justify-center">
        <ToggleButtonGroup
          options={options}
          value={value}
          onChange={onChange}
          getLabel={getLabel}
        />
      </div>
    </div>
  );
}

const FilterModal: React.FC = () => {
  const {
    styleFilter,
    manifestFilter,
    categoryFilter,
    alterFilter,
    lightShadowFilter,
    staralignFilter,
    grastaWeaponTemperingFilter,
    dungeon,
    setStyleFilter,
    setManifestFilter,
    setCategoryFilter,
    setAlterFilter,
    setLightShadowFilter,
    setStaralignFilter,
    setGrastaWeaponTemperingFilter,
    setDungeon,
    removeFilter,
  } = useFilterStore();
  const { hideModal } = useModalStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["getDungeons"],
    queryFn: () => fetchAPI("dungeon"),
    throwOnError: true,
  });

  if (isPending) return <Loading />;
  if (error) return <div className="text-destructive">An error has occurred: {error.message}</div>;

  const dungeons = (data as APIResponse<DungeonInfo[]>).data.map(
    (info) => info.id
  );

  return (
    <Dialog open={true} onOpenChange={hideModal}>
      <DialogContent className="w-[290px] max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Filter</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-center">
          <ToggleGroup
            label={t("frontend.filter.style")}
            options={Object.values(AECharacterStyles)}
            value={styleFilter}
            onChange={setStyleFilter}
            getLabel={(opt) => opt}
          />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">{t("frontend.manifest.step1")}</Label>
            <div className="flex justify-center gap-0.5">
              {Object.values(AEManifestLevels).map((opt) => {
                const isSelected = manifestFilter.includes(opt);
                const label = t(`frontend.manifest.step${opt}`);
                const parts = label.split(' ');

                return (
                  <Button
                    key={opt}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newValue = isSelected
                        ? manifestFilter.filter((v) => v !== opt)
                        : [...manifestFilter, opt];
                      setManifestFilter(newValue);
                    }}
                    className="relative focus:z-10 transition-all text-xs px-2 py-1 h-auto min-h-[40px] flex flex-col items-center justify-center leading-tight"
                  >
                    {parts.map((part, idx) => (
                      <span key={idx}>{part}</span>
                    ))}
                  </Button>
                );
              })}
            </div>
          </div>

          <ToggleGroup
            label={t("frontend.word.staralign")}
            options={Object.values(AEAwakenStatus)}
            value={staralignFilter}
            onChange={setStaralignFilter}
            getLabel={(opt) => t(`frontend.staralign.${opt}`)}
          />

          <ToggleGroup
            label={t("frontend.filter.light-shadow")}
            options={Object.values(AELightShadow)}
            value={lightShadowFilter}
            onChange={setLightShadowFilter}
            getLabel={(opt) => t(`frontend.light-shadow.${opt}`)}
          />

          <ToggleGroup
            label={t("frontend.filter.category")}
            options={Object.values(AECategories)}
            value={categoryFilter}
            onChange={setCategoryFilter}
            getLabel={(opt) => t(`frontend.category.${opt.toLowerCase()}`)}
          />

          <ToggleGroup
            label={t("frontend.filter.alter")}
            options={Object.values(AEAlterStatus)}
            value={alterFilter}
            onChange={setAlterFilter}
            getLabel={(opt) => t(`alter.${opt}`)}
          />

          <ToggleGroup
            label={t("frontend.manifest.weaponTempering")}
            options={[GrastaWeaponTemperingFilter.hasWeaponTempering, GrastaWeaponTemperingFilter.noWeaponTempering]}
            value={grastaWeaponTemperingFilter}
            onChange={setGrastaWeaponTemperingFilter}
            getLabel={(opt) => t(`frontend.filter.weaponTempering.${opt}`)}
          />

          <div className="h-2" />

          <PersonalitySelect />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">
              {t("frontend.filter.bookdrop")}
            </Label>
            <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {dungeon ? t(dungeon) : "Select"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {dungeons.map((dungeonId) => (
                        <CommandItem
                          key={dungeonId}
                          value={t(dungeonId)}
                          onSelect={() => {
                            setDungeon(dungeonId === dungeon ? null : dungeonId);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              dungeon === dungeonId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {t(dungeonId)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            </div>
          </div>

          <Button
            variant="default"
            className="mt-2 bg-orange-600 hover:bg-orange-700"
            onClick={removeFilter}
          >
            FILTER CLEAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
