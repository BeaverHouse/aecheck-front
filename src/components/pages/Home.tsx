"use client";

import LanguageButton from "../atoms/button/Language";
import { useQuery } from "@tanstack/react-query";
import { LanguageOptions, MenuOptions, ModalType } from "../../constants/enum";
import { CheckCircle, Search, BarChart3, Link as LinkIcon } from "lucide-react";
import useModalStore from "../../store/useModalStore";
import i18n from "../../i18n";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AppInfo } from "../../constants";
import Loading from "../atoms/Loading";
import { fetchAPI } from "../../util/api";
import { Card, CardContent } from "@/components/ui/card";

function HomePage() {
  const { t } = useTranslation();
  const { setModal } = useModalStore();
  const router = useRouter();
  const { isPending, data } = useQuery({
    queryKey: ["getCharacters"],
    queryFn: () => fetchAPI("character"),
    throwOnError: true,
  });

  if (isPending) return <Loading />;

  const characters = (data as APIResponse<CharacterSummary[]>).data;
  const totalCodes = Array.from(new Set(characters.map((c) => c.code)));

  const guideLink =
    i18n.language === LanguageOptions.ko
      ? AppInfo.koGuideLink
      : AppInfo.enGuideLink;

  const menuData = [
    {
      label: MenuOptions.check,
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      label: MenuOptions.search,
      icon: <Search className="w-6 h-6" />,
    },
    {
      label: MenuOptions.analysis,
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      label: MenuOptions.link,
      icon: <LinkIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-4 bg-background">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-2xl font-semibold mb-2">
          Total Characters : {totalCodes.length + 23}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          ( {totalCodes.length} + 23 3★ {t("frontend.word.character")} )
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
          {menuData.map((menu) => (
            <Card
              key={menu.label}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push(`/${menu.label}`)}
            >
              <CardContent className="flex flex-col items-center justify-center h-[75px] p-4">
                {menu.icon}
                <span className="text-sm font-medium mt-2">
                  {t(`frontend.menu.${menu.label}`)}
                </span>
              </CardContent>
            </Card>
          ))}
          <Card
            className="col-span-2 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => window.open(guideLink, "_blank")}
          >
            <CardContent className="flex items-center justify-center h-[75px] p-4">
              <span className="text-sm font-medium">
                About {AppInfo.name}
              </span>
            </CardContent>
          </Card>
          <Card
            className="col-span-2 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setModal(ModalType.settings)}
          >
            <CardContent className="flex items-center justify-center h-[75px] p-4">
              <span className="text-sm font-medium">
                {t("settings.title")}
              </span>
            </CardContent>
          </Card>
        </div>

        <LanguageButton />
      </div>
    </div>
  );
}

export default HomePage;
