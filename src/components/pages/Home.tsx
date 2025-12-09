"use client";

import LanguageButton from "../atoms/button/Language";
import { useQuery } from "@tanstack/react-query";
import { LanguageOptions, MenuOptions, ModalType } from "../../constants/enum";
import { CheckCircle, Search, BarChart3, Mail, Github } from "lucide-react";
import useModalStore from "../../store/useModalStore";
import i18n from "../../i18n";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AppInfo } from "../../constants";
import Loading from "../atoms/Loading";
import { fetchAPI } from "../../util/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import BuyMeACoffeeButton from "../atoms/button/BuyMeACoffee";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "../ui/custom/hybrid-tooltip";

const ExternalLinks = [
  {
    link: "https://anothereden.wiki",
    label: "wiki",
    desc: "Another Eden Wiki",
  },
  {
    link: "https://altema.jp",
    label: "altema",
    desc: "altema.jp",
  },
  {
    link: "https://anothereden.game-info.wiki",
    label: "seesaa",
    desc: "Seesaa Wiki (JP)",
  },
];

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
      icon: <CheckCircle className="w-7 h-7" />,
    },
    {
      label: MenuOptions.search,
      icon: <Search className="w-7 h-7" />,
    },
    {
      label: MenuOptions.analysis,
      icon: <BarChart3 className="w-7 h-7" />,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-60px)] bg-background">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 dark:opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/bg-home.png')" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
            AE Check
          </h1>
          <p className="text-lg text-muted-foreground">
            Total Characters: {totalCodes.length + 23}
          </p>
          <p className="text-sm text-muted-foreground/70">
            ( {totalCodes.length} + 23 3★ {t("frontend.word.character")} )
          </p>
        </div>

        {/* Main Menu Cards */}
        <div className="w-full max-w-lg mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {menuData.map((menu) => (
              <Card
                key={menu.label}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-card backdrop-blur-sm border-border"
                onClick={() => router.push(`/${menu.label}`)}
              >
                <CardContent className="flex flex-col items-center justify-center h-[100px] p-4">
                  {menu.icon}
                  <span className="text-sm font-semibold mt-2">
                    {t(`frontend.menu.${menu.label}`)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card
              className="cursor-pointer hover:bg-accent/50 transition-colors backdrop-blur-sm border-border/50"
              onClick={() => window.open(guideLink, "_blank")}
            >
              <CardContent className="flex items-center justify-center h-[60px] p-3">
                <span className="text-sm font-medium">
                  About {AppInfo.name}
                </span>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-accent/50 transition-colors backdrop-blur-sm border-border/50"
              onClick={() => setModal(ModalType.settings)}
            >
              <CardContent className="flex items-center justify-center h-[60px] p-3">
                <span className="text-sm font-medium">
                  {t("settings.title")}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Language Button */}
          <div className="flex justify-center mb-8">
            <LanguageButton />
          </div>

          {/* Other Sites Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">
              Other Sites
            </h2>
            <TooltipProvider>
              <div className="flex justify-center gap-4">
                {ExternalLinks.map((data) => (
                  <HybridTooltip key={data.label}>
                    <HybridTooltipTrigger>
                      <a
                        href={data.link}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        <Avatar className="w-12 h-12 ring-2 ring-border hover:ring-primary cursor-pointer">
                          <AvatarImage
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/icon/${data.label}.jpg`}
                            alt={data.desc}
                          />
                        </Avatar>
                      </a>
                    </HybridTooltipTrigger>
                    <HybridTooltipContent>
                      <p>{data.desc}</p>
                    </HybridTooltipContent>
                  </HybridTooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>

          <BuyMeACoffeeButton />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-sm py-4 mt-auto">
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <a
            href="https://github.com/BeaverHouse/aecheck-front"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="mailto:haulrest@gmail.com"
            className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
