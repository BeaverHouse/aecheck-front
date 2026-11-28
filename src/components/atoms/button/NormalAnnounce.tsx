"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X, Info } from "lucide-react";
import { useState, useEffect } from "react";

const ANNOUNCE_KEY = "AE_ANNOUNCE_3_2";
const ANNOUNCE_DATE = "20261128"; // a new date shows the banner again to everyone

function NormalAnnounce() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [announceViewed, setAnnounceViewed] = useState(true);

  useEffect(() => {
    const viewed = window.localStorage.getItem(ANNOUNCE_KEY) === ANNOUNCE_DATE;
    setAnnounceViewed(viewed);
  }, []);

  if (announceViewed || !visible) return null;

  const title = "26.11.28 Update";

  const handleDismiss = () => {
    window.localStorage.setItem(ANNOUNCE_KEY, ANNOUNCE_DATE);
    setVisible(false);
  };

  return (
    <div className="sticky top-[60px] z-40 w-full border-b bg-accent border-primary/30">
      <div className="flex items-center justify-between px-4 py-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 shrink-0 text-foreground" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-sm text-foreground">
              {title}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("announce.desc")}{" "}
              <Link
                href="/release"
                prefetch={false}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {t("announce.release")}
              </Link>
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-foreground hover:bg-primary/20"
          onClick={handleDismiss}
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default NormalAnnounce;
