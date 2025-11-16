"use client";

import React, { useState } from "react";
import useFilterStore from "../../store/useFilterStore";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { fetchAPI } from "../../util/api";

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  getOptionLabel: (opt: string) => string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  getOptionLabel,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleRemove = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[36px] h-auto text-xs"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {value.length === 0 ? (
                <span className="text-muted-foreground text-xs">Select</span>
              ) : (
                value.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="font-bold text-xs px-1.5 py-0.5"
                  >
                    {getOptionLabel(item)}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(item);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={getOptionLabel(option)}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {getOptionLabel(option)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const PersonalitySelect: React.FC = () => {
  const { essenTialPersonalityTags, choosePersonalityTags, setPersonalities } =
    useFilterStore();
  const { t } = useTranslation();

  const { isPending, error, data } = useQuery({
    queryKey: ["getPersonalities"],
    queryFn: () => fetchAPI("personality"),
    throwOnError: true,
  });

  if (isPending)
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-9 w-full" />
      </div>
    );

  if (error) return <div className="text-destructive text-xs">An error has occurred: {error.message}</div>;

  const personalities = (data as APIResponse<IDInfo[]>).data.map(
    (info) => info.id
  );

  return (
    <>
      <MultiSelect
        label={t("frontend.filter.essentialpersonality")}
        options={personalities}
        value={essenTialPersonalityTags}
        onChange={(value) => setPersonalities(value, true)}
        getOptionLabel={(opt) => t(opt)}
      />
      <MultiSelect
        label={t("frontend.filter.choosepersonality")}
        options={personalities}
        value={choosePersonalityTags}
        onChange={(value) => setPersonalities(value, false)}
        getOptionLabel={(opt) => t(opt)}
      />
    </>
  );
};

export default PersonalitySelect;
