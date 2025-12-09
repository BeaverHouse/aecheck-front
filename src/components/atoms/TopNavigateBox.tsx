"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import useConfigStore from "../../store/useConfigStore";
import {
  AnalysisMenuOptions,
  MenuOptions,
  CheckMenuOptions,
} from "../../constants/enum";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";

const TopNavigateBox: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const {
    lastCheckMenu,
    lastSearchMenu,
    lastAnalysisMenu,
    updateLastCheckMenu,
    updateLastSearchMenu,
    updateLastAnalysisMenu,
  } = useConfigStore();

  const [category, setCategory] = React.useState<MenuOptions | null>(null);

  React.useEffect(() => {
    const path = pathname || "/";
    const currentCategory = path.split("/")[1] as MenuOptions;
    setCategory(currentCategory);
  }, [pathname]);

  if (
    !category ||
    (category !== MenuOptions.check &&
      category !== MenuOptions.search &&
      category !== MenuOptions.analysis)
  )
    return null;

  const currentOption = {
    [MenuOptions.analysis]: lastAnalysisMenu,
    [MenuOptions.search]: lastSearchMenu,
    [MenuOptions.check]: lastCheckMenu,
  }[category];

  const options =
    category === MenuOptions.analysis ? AnalysisMenuOptions : CheckMenuOptions;

  const handleChange = (value: string) => {
    // Check if it's a menu navigation
    if (Object.values(MenuOptions).includes(value as MenuOptions)) {
      router.push(`/${value}`);
      return;
    }

    // Otherwise update the current menu option
    switch (category) {
      case MenuOptions.check:
        updateLastCheckMenu(value as CheckMenuOptions);
        break;
      case MenuOptions.search:
        updateLastSearchMenu(value as CheckMenuOptions);
        break;
      case MenuOptions.analysis:
        updateLastAnalysisMenu(value as AnalysisMenuOptions);
        break;
    }
  };

  return (
    <Select value={currentOption} onValueChange={handleChange}>
      <SelectTrigger className="min-w-[250px] max-w-[250px] mx-auto text-center">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(options).map((option) => (
          <SelectItem key={option} value={option}>
            {t(`frontend.select.${option}`)}
          </SelectItem>
        ))}
        <SelectSeparator />
        {Object.values(MenuOptions).map((menu) => (
          <SelectItem
            key={menu}
            value={menu}
            className="text-secondary-foreground"
          >
            {t(`frontend.menu.${menu}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TopNavigateBox;
