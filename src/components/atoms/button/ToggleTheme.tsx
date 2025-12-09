import { Sun, Moon } from "lucide-react";
import useConfigStore from "../../../store/useConfigStore";
import { Switch } from "@/components/ui/switch";
import { ThemeOptions } from "../../../constants/enum";

function ToggleThemeButton() {
  const { theme, toggleTheme } = useConfigStore();

  return (
    <div className="flex items-center justify-center gap-2">
      <Sun className="w-5 h-5" />
      <Switch
        checked={theme === ThemeOptions.dark}
        onCheckedChange={(checked) =>
          toggleTheme(checked ? ThemeOptions.dark : ThemeOptions.light)
        }
        className="data-[state=checked]:bg-white/50 data-[state=checked]:border-white/70"
      />
      <Moon className="w-5 h-5" />
    </div>
  );
}

export default ToggleThemeButton;
