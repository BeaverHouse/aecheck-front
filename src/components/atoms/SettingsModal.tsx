import React from "react";
import { useTranslation } from "react-i18next";
import useConfigStore from "../../store/useConfigStore";
import useCheckStore from "../../store/useCheckStore";
import useModalStore from "../../store/useModalStore";
import i18n from "../../i18n";
import {
  DisplayMode,
  PopupOnCheckOptions,
  ThemeOptions,
  LanguageOptions,
} from "../../constants/enum";
import { getNumber } from "../../util/func";
import Swal from "sweetalert2";
import {
  Sun,
  Moon,
  Monitor,
  Scroll,
  Copy,
  Upload,
  Eye,
  Palette,
} from "lucide-react";
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
  const {
    displayMode,
    setDisplayMode,
    popupOnCheck,
    setPopupOnCheck,
    theme,
    toggleTheme,
    colorBlindMode,
    setColorBlindMode,
  } = useConfigStore();
  const {
    inven,
    grasta,
    manifest,
    staralign,
    buddy,
    weaponTempering,
    loadSaveData,
  } = useCheckStore();
  const { hideModal } = useModalStore();
  const { t } = useTranslation();

  const [dataText, setDataText] = React.useState(() =>
    JSON.stringify(
      {
        inven,
        grasta,
        manifest,
        staralign,
        buddy,
        weaponTempering,
      },
      null,
      2
    )
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
    toggleTheme(
      theme === ThemeOptions.dark ? ThemeOptions.light : ThemeOptions.dark
    );
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
          <DialogTitle className="text-xl">{t("settings.title")}</DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </DialogHeader>

        <Accordion
          type="single"
          collapsible
          defaultValue="display"
          className="w-full"
        >
          {/* Display Settings */}
          <AccordionItem value="display">
            <AccordionTrigger className="text-base font-semibold hover:no-underline rounded-lg px-3 hover:bg-accent/50">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">Display</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pt-1 pb-4">
              <div className="space-y-4">
                {/* Display Mode */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t("settings.displayMode.title")}
                  </Label>
                  <RadioGroup
                    value={displayMode}
                    onValueChange={handleDisplayModeChange}
                    className="mt-1"
                  >
                    <label
                      htmlFor="pagination"
                      className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-all ${
                        displayMode === DisplayMode.pagination
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={DisplayMode.pagination}
                        id="pagination"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">
                          {t("settings.displayMode.pagination")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t("settings.displayMode.paginationDesc")}
                        </div>
                      </div>
                    </label>

                    <label
                      htmlFor="infiniteScroll"
                      className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-all ${
                        displayMode === DisplayMode.infiniteScroll
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={DisplayMode.infiniteScroll}
                        id="infiniteScroll"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">
                          {t("settings.displayMode.infiniteScroll")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t("settings.displayMode.infiniteScrollDesc")}
                        </div>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <Separator className="my-4" />

                {/* Popup on Check */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {t("frontend.message.popup-on-check")}
                  </Label>
                  <RadioGroup
                    value={popupOnCheck}
                    onValueChange={handlePopupOnCheckChange}
                    className="flex flex-wrap gap-2"
                  >
                    {Object.values(PopupOnCheckOptions).map((option) => (
                      <label
                        key={option}
                        htmlFor={option}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                          popupOnCheck === option
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={option}
                          id={option}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {t(`frontend.config.${option}`)}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appearance */}
          <AccordionItem value="appearance">
            <AccordionTrigger className="text-base font-semibold hover:no-underline rounded-lg px-3 hover:bg-accent/50">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">Theme</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pt-1 pb-4">
              <div className="space-y-3">
                {/* Language */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      Language
                    </span>
                  </div>
                  <RadioGroup
                    value={i18n.language}
                    onValueChange={(val) =>
                      handleLanguageChange(val as LanguageOptions)
                    }
                    className="flex gap-1"
                  >
                    {Object.values(LanguageOptions).map((lang) => (
                      <label
                        key={lang}
                        htmlFor={`lang-${lang}`}
                        className={`px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm font-medium ${
                          i18n.language === lang
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        <RadioGroupItem
                          value={lang}
                          id={`lang-${lang}`}
                          className="sr-only"
                        />
                        {lang.toUpperCase()}
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground">/</span>
                      <Moon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      Dark Mode
                    </span>
                  </div>
                  <Switch
                    checked={theme === ThemeOptions.dark}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>

                {/* Color Blind Mode */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-sm font-medium text-foreground block">
                      {t("settings.colorBlindMode")}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {t("settings.colorBlindModeDesc")}
                    </span>
                  </div>
                  <Switch
                    checked={colorBlindMode}
                    onCheckedChange={setColorBlindMode}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Data Management */}
          <AccordionItem value="data">
            <AccordionTrigger className="text-base font-semibold hover:no-underline rounded-lg px-3 hover:bg-accent/50">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {t("frontend.menu.loader")}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pt-1 pb-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-lg">
                  {t("frontend.menu.loader.description")}
                </p>
                <Textarea
                  rows={8}
                  className="w-full font-mono text-xs text-foreground bg-muted/50 border-muted-foreground/20"
                  value={dataText}
                  onChange={(e) => setDataText(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-foreground"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                    onClick={loadData}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Load</span>
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
