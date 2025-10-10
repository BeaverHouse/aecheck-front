import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useState } from "react";

function NormalAnnounce() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(true);

  const announceViewed = window.localStorage.getItem("AE_ANNOUNCE_3_2") === "true";

  if (announceViewed || !visible) return null;

  const title = i18n.language === "ko"
    ? "서비스 안내"
    : "Service Notice";

  const description = i18n.language === "ko"
    ? "디자인 변경과 커스텀 현현 체크를 추가할 예정입니다. 조금만 더 기다려 주세요."
    : "Design change and Weapon Tempering check will be added. Please wait a moment.";

  return (
    <Alert
      variant="filled"
      severity="info"
      id="normal-announce"
      onClose={() => {
        window.localStorage.setItem("AE_ANNOUNCE_3_2", "true");
        setVisible(false);
      }}
      sx={{ maxWidth: "400px", margin: "0 auto", textAlign: "left" }}
    >
      <AlertTitle>{title}</AlertTitle>
      <div style={{ whiteSpace: "pre-line" }}>
        {description}
      </div>
    </Alert>
  );
}

export default NormalAnnounce;
