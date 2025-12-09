"use client";

import React from "react";
import {
  CheckCircle,
  Search,
  BarChart3,
  Home,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import LanguageButton from "../atoms/button/Language";
import useModalStore from "../../store/useModalStore";
import { MenuOptions, ModalType } from "../../constants/enum";
import { AppInfo } from "../../constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

function AECheckSidebar() {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const { setModal } = useModalStore();

  const menuData = [
    {
      label: MenuOptions.check,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: MenuOptions.search,
      icon: <Search className="w-5 h-5" />,
    },
    {
      label: MenuOptions.analysis,
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="min-w-[40px] ml-0"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-[240px] flex flex-col h-full bg-background text-foreground"
        >
          <SheetHeader className="flex flex-row justify-between items-center p-2">
            <SheetTitle className="text-foreground">{AppInfo.name}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetHeader>

          <Separator className="mt-2 mb-2" />

          <div className="flex-1 overflow-auto">
            <nav className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-[30px] px-2 text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  router.push("/");
                  setOpen(false);
                }}
              >
                <Home className="w-5 h-5 mr-2" />
                HOME
              </Button>

              <Separator className="mt-2 mb-2" />

              {menuData.map(({ label, icon }) => (
                <Button
                  key={label}
                  variant="ghost"
                  className="w-full justify-start h-[30px] px-2 mt-1 text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    router.push(`/${label}`);
                    setOpen(false);
                  }}
                >
                  {icon}
                  <span className="ml-2">{t(`frontend.menu.${label}`)}</span>
                </Button>
              ))}

              <Separator className="mt-2 mb-2" />

              <Button
                variant="ghost"
                className="w-full justify-start h-[30px] px-2 text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setModal(ModalType.settings);
                  setOpen(false);
                }}
              >
                <Settings className="w-5 h-5 mr-2" />
                {t("settings.title")}
              </Button>
            </nav>
          </div>

          <div className="mt-auto pt-4">
            <LanguageButton />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AECheckSidebar;
