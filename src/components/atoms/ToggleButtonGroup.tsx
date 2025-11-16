import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToggleButtonGroupProps<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getLabel: (option: T) => string | React.ReactNode;
  className?: string;
  buttonClassName?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

function ToggleButtonGroup<T extends string | number | boolean>({
  options,
  value,
  onChange,
  getLabel,
  className,
  buttonClassName,
  size = "sm",
}: ToggleButtonGroupProps<T>) {
  const toggleValue = (option: T) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className={cn("inline-flex flex-wrap rounded-md shadow-sm gap-0.5 justify-center", className)} role="group">
      {options.map((option) => {
        const isSelected = value.includes(option);

        return (
          <Button
            key={String(option)}
            variant={isSelected ? "default" : "outline"}
            size={size}
            onClick={() => toggleValue(option)}
            className={cn(
              "relative focus:z-10 transition-all text-xs px-2 py-1 h-auto min-h-[28px]",
              isSelected && "z-10",
              buttonClassName
            )}
          >
            {getLabel(option)}
          </Button>
        );
      })}
    </div>
  );
}

export default ToggleButtonGroup;
