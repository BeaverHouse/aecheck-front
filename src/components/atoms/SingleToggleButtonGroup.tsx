import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SingleToggleButtonGroupProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string | React.ReactNode;
  className?: string;
  buttonClassName?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

function SingleToggleButtonGroup<T extends string | number | boolean>({
  options,
  value,
  onChange,
  getLabel,
  className,
  buttonClassName,
  size = "sm",
}: SingleToggleButtonGroupProps<T>) {
  return (
    <div className={cn("inline-flex rounded-md shadow-sm gap-0", className)} role="group">
      {options.map((option, index) => {
        const isSelected = value === option;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <Button
            key={String(option)}
            variant={isSelected ? "default" : "outline"}
            size={size}
            onClick={() => onChange(option)}
            className={cn(
              "relative focus:z-10 transition-all",
              !isFirst && !isLast && "rounded-none",
              isFirst && "rounded-r-none",
              isLast && "rounded-l-none",
              !isFirst && "border-l",
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

export default SingleToggleButtonGroup;
