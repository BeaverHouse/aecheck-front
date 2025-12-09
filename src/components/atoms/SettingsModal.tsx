import React from "react";
import { useTranslation } from "react-i18next";
import useConfigStore from "../../store/useConfigStore";
import useCheckStore from "../../store/useCheckStore";
import useModalStore from "../../store/useModalStore";
import i18n from "../../i18n";
import { DisplayMode, PopupOnCheckOptions, ThemeOptions, LanguageOptions } from "../../constants/enum";
import { getNumber } from "../../util/func";
import Swal from "sweetalert2";
import { Sun, Moon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SettingsModal: React.FC = () => {
  const { displayMode, setDisplayMode, popupOnCheck, setPopupOnCheck, theme, toggleTheme, colorBlindMode, setColorBlindMode } = useConfigStore();
  const { inven, grasta, manifest, staralign, buddy, weaponTempering, loadSaveData } = useCheckStore();
  const { hideModal } = useModalStore();
  const { t } = useTranslation();

  const [dataText, setDataText] = React.useState(() =>
    JSON.stringify({
      inven,
      grasta,
      manifest,
      staralign,
      buddy,
      weaponTempering,
    }, null, 2)
  );

  const handleDisplayModeChange = (value: string) => {
    setDisplayMode(value as DisplayMode);
  };

  const handlePopupOnCheckChange = (value: string) => {
    setPopupOnCheck(value as PopupOnCheckOptions);
  };

  const handleLanguageChange = (lang: LanguageOptions) => {
    i18n.changeLanguage(lang);
  };

  const handleThemeToggle = () => {
    toggleTheme(theme === ThemeOptions.dark ? ThemeOptions.light : ThemeOptions.dark);
  };

  const loadData = async () => {
    try {
      const newData: CheckStateV4 = JSON.parse(dataText.trim());
      if (!newData.buddy) {
        const charIds = newData.inven.map(
          (i) => `char${String(i).padStart(4, "0")}`
        );
        const body = {
          characterIds: charIds,
        };
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/buddy/partners`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
        const buddyList = (
          (await res.json()) as APIResponse<IDInfo[]>
        ).data.map((i) => getNumber(i));

        newData.buddy = buddyList;
      }
      loadSaveData(newData);
      Swal.fire({
        text: "Data Load Success",
        width: 280,
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        customClass: {
          popup: "alert",
        },
      }).then(() => {
        window.location.reload();
      });
    } catch {
      Swal.fire({
        text: "Data Load Error",
        width: 280,
        timer: 1000,
        showConfirmButton: false,
        timerProgressBar: true,
        customClass: {
          popup: "alert",
        },
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dataText);
    Swal.fire({
      text: "Copied to clipboard!",
      width: 280,
      timer: 1000,
      showConfirmButton: false,
      customClass: {
        popup: "alert",
      },
    });
  };

  return (
    <Dialog open={true} onOpenChange={hideModal}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </DialogHeader>

        <Accordion type="single" collapsible defaultValue="display" className="w-full">
          {/* Display Settings */}
          <AccordionItem value="display">
            <AccordionTrigger className="text-base font-semibold">
              Display Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              {/* Display Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("settings.displayMode.title")}
                </Label>
                <RadioGroup
                  value={displayMode}
                  onValueChange={handleDisplayModeChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={DisplayMode.pagination} id="pagination" />
                    <Label htmlFor="pagination" className="flex-1 cursor-pointer font-normal">
                      <div className="font-medium">{t("settings.displayMode.pagination")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("settings.displayMode.paginationDesc")}
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value={DisplayMode.infiniteScroll} id="infiniteScroll" />
                    <Label htmlFor="infiniteScroll" className="flex-1 cursor-pointer font-normal">
                      <div className="font-medium">{t("settings.displayMode.infiniteScroll")}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("settings.displayMode.infiniteScrollDesc")}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Popup on Check (4.5★ only) */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label className="text-sm font-medium">
                  {t("frontend.message.popup-on-check")}
                </Label>
                <RadioGroup
                  value={popupOnCheck}
                  onValueChange={handlePopupOnCheckChange}
                  className="flex gap-4"
                >
                  {Object.values(PopupOnCheckOptions).map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer font-normal text-sm">
                        {t(`frontend.config.${option}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance */}
          <AccordionItem value="appearance">
            <AccordionTrigger className="text-base font-semibold">
              Appearance
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {/* Language */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label className="text-sm font-medium">Language</Label>
                <RadioGroup
                  value={i18n.language}
                  onValueChange={(val) => handleLanguageChange(val as LanguageOptions)}
                  className="flex gap-4"
                >
                  {Object.values(LanguageOptions).map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <RadioGroupItem value={lang} id={`lang-${lang}`} />
                      <Label htmlFor={`lang-${lang}`} className="cursor-pointer font-normal text-sm">
                        {lang.toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  <span className="text-sm font-medium">Light / Dark</span>
                  <Moon className="w-5 h-5" />
                </div>
                <Switch
                  checked={theme === ThemeOptions.dark}
                  onCheckedChange={handleThemeToggle}
                />
              </div>

              {/* Color Blind Mode */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t("settings.colorBlindMode")}</span>
                  <span className="text-xs text-muted-foreground">{t("settings.colorBlindModeDesc")}</span>
                </div>
                <Switch
                  checked={colorBlindMode}
                  onCheckedChange={setColorBlindMode}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Data Management */}
          <AccordionItem value="data">
            <AccordionTrigger className="text-base font-semibold">
              {t("frontend.menu.loader")}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                {t("frontend.menu.loader.description")}
              </p>
              <Textarea
                rows={10}
                className="w-full font-mono text-xs"
                value={dataText}
                onChange={(e) => setDataText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyToClipboard}
                >
                  COPY
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={loadData}
                >
                  LOAD
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
