"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X, Info } from "lucide-react";
import { useState, useEffect } from "react";

function NormalAnnounce() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [announceViewed, setAnnounceViewed] = useState(true);

  useEffect(() => {
    const viewed =
      window.localStorage.getItem("AE_ANNOUNCE_3_2") === "20260209";
    setAnnounceViewed(viewed);
  }, []);

  if (announceViewed || !visible) return null;

  const title = "26.02.09 Update";

  const description =
    i18n.language === "ko"
      ? "디자인과 버그를 수정하고, 티어 표시 기능을 추가했어요."
      : "Design and bug fixes have been made, and the tier display function has been added.";

  const handleDismiss = () => {
    window.localStorage.setItem("AE_ANNOUNCE_3_2", "20260209");
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
            <span className="text-sm text-muted-foreground">{description}</span>
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
