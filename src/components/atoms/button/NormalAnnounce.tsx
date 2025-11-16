"use client";

import { useTranslation } from "react-i18next";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Info } from "lucide-react";
import { useState, useEffect } from "react";

function NormalAnnounce() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [announceViewed, setAnnounceViewed] = useState(true);

  useEffect(() => {
    const viewed = window.localStorage.getItem("AE_ANNOUNCE_3_2") === "20251116";
    setAnnounceViewed(viewed);
  }, []);

  if (announceViewed || !visible) return null;

  const title = "25.11.16 Update";

  const description = i18n.language === "ko"
    ? "디자인을 변경하고 결실 현현 체크를 추가했어요. 디자인은 계속 개선할 예정이에요."
    : "Changed the design and added the weapon tempering check. The design will be improved continuously.";

  const handleDismiss = () => {
    window.localStorage.setItem("AE_ANNOUNCE_3_2", "20251116");
    setVisible(false);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <Alert
        id="normal-announce"
        className="text-left bg-blue-500 text-white border-blue-600"
      >
        <Info className="h-4 w-4 !text-white" />
        <AlertTitle className="text-white pr-8">{title}</AlertTitle>
        <AlertDescription className="whitespace-pre-line text-white pr-8">
          {description}
        </AlertDescription>
      </Alert>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 text-white hover:bg-blue-600/50 hover:text-white rounded-sm"
        onClick={handleDismiss}
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default NormalAnnounce;
