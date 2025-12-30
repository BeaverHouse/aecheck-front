import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useFilterStore from "../../store/useFilterStore";
import PersonalitySelect from "../atoms/PersonalitySelect";
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
  DialogFooter,
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
import { Check, ChevronsUpDown, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAPI } from "../../util/api";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <Badge
              key={String(option)}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-3 py-1.5 min-w-[3rem] justify-center transition-all duration-200 hover:opacity-80",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-background hover:bg-accent text-foreground border-border hover:border-accent-foreground/30"
              )}
              onClick={() => {
                const newValue = isSelected
                  ? value.filter((v) => v !== option)
                  : [...value, option];
                onChange(newValue);
              }}
            >
              {getLabel(option)}
            </Badge>
          );
        })}
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
  if (error)
    return (
      <div className="text-destructive">
        An error has occurred: {error.message}
      </div>
    );

  const dungeons = (data as APIResponse<DungeonInfo[]>).data.map(
    (info) => info.id
  );

  return (
    <Dialog open={true} onOpenChange={hideModal}>
      <DialogContent className="w-[95%] max-w-[500px] max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-card/95 backdrop-blur-sm border-border">
        <DialogHeader className="px-6 py-4 border-b border-border bg-background/50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Filter className="w-5 h-5 text-primary" />
            {t("frontend.header.filter", "Filter")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Attributes Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ToggleGroup
              label={t("frontend.filter.style")}
              options={Object.values(AECharacterStyles)}
              value={styleFilter}
              onChange={setStyleFilter}
              getLabel={(opt) => opt}
            />

            <ToggleGroup
              label={t("frontend.word.staralign")}
              options={Object.values(AEAwakenStatus)}
              value={staralignFilter}
              onChange={setStaralignFilter}
              getLabel={(opt) => t(`frontend.staralign.${opt}`)}
            />
          </div>

          <div className="border-t border-border/50" />

          {/* Type & Manifest Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ToggleGroup
              label={t("frontend.filter.light-shadow")}
              options={Object.values(AELightShadow)}
              value={lightShadowFilter}
              onChange={setLightShadowFilter}
              getLabel={(opt) => t(`frontend.light-shadow.${opt}`)}
            />

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("frontend.manifest.step1")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(AEManifestLevels).map((opt) => {
                  const isSelected = manifestFilter.includes(opt);
                  const label = t(`frontend.manifest.step${opt}`);

                  return (
                    <Badge
                      key={opt}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-3 py-1.5 text-center transition-all bg-background hover:bg-accent text-foreground whitespace-nowrap",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-transparent"
                      )}
                      onClick={() => {
                        const newValue = isSelected
                          ? manifestFilter.filter((v) => v !== opt)
                          : [...manifestFilter, opt];
                        setManifestFilter(newValue);
                      }}
                    >
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Categories Section */}
          <div className="grid grid-cols-1 gap-6">
            <ToggleGroup
              label={t("frontend.filter.category")}
              options={Object.values(AECategories)}
              value={categoryFilter}
              onChange={setCategoryFilter}
              getLabel={(opt) => t(`frontend.category.${opt.toLowerCase()}`)}
            />

            <div className="grid grid-cols-2 gap-4">
              <ToggleGroup
                label={t("frontend.filter.alter")}
                options={Object.values(AEAlterStatus)}
                value={alterFilter}
                onChange={setAlterFilter}
                getLabel={(opt) => t(`alter.${opt}`)}
              />
              <ToggleGroup
                label={t("frontend.manifest.weaponTempering")}
                options={[
                  GrastaWeaponTemperingFilter.hasWeaponTempering,
                  GrastaWeaponTemperingFilter.noWeaponTempering,
                ]}
                value={grastaWeaponTemperingFilter}
                onChange={setGrastaWeaponTemperingFilter}
                getLabel={(opt) => t(`frontend.filter.weaponTempering.${opt}`)}
              />
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Personality & Dungeon Section */}
          <div className="space-y-6">
            <PersonalitySelect />

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("frontend.filter.bookdrop")}
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 bg-background text-foreground"
                  >
                    <span
                      className={cn(
                        "text-sm",
                        !dungeon && "text-muted-foreground"
                      )}
                    >
                      {dungeon
                        ? t(dungeon)
                        : t("frontend.word.select", "Select")}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={t("frontend.word.search", "Search...")}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t("frontend.word.noResults", "No results found.")}
                      </CommandEmpty>
                      <CommandGroup>
                        {dungeons.map((dungeonId) => (
                          <CommandItem
                            key={dungeonId}
                            value={t(dungeonId)}
                            onSelect={() => {
                              setDungeon(
                                dungeonId === dungeon ? null : dungeonId
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                dungeon === dungeonId
                                  ? "opacity-100"
                                  : "opacity-0"
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
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-background/50 sm:justify-between">
          <div className="hidden sm:block"></div>{" "}
          {/* Spacer for center alignment trick if needed, or just justify-end */}
          <Button
            variant="destructive"
            className="w-full sm:w-auto gap-2"
            onClick={removeFilter}
          >
            <X className="w-4 h-4" />
            {t("frontend.word.clear", "CLEAR FILTER")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
