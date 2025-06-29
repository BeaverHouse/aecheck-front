import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

function NormalAnnounce() {
  const { t } = useTranslation();
  const { isPending, data, error } = useQuery<AnnouncementData, Error>({
    queryKey: ["normalAnnounce"],
    queryFn: () =>
      fetch(
        "https://raw.githubusercontent.com/BeaverHouse/service-status/refs/heads/master/assets/announce-status.json"
      ).then((res) => {
        if (res.ok) return res.json();
        else
          return {
            state: "",
            title: "",
            link: "",
            createdTime: "",
            effect: [],
            category: "",
          };
      }),
    throwOnError: true,
  });

  const announceViewed =
    window.localStorage.getItem("AE_ANNOUNCE_3_1") === data?.createdTime;

  if (
    isPending ||
    error ||
    !data.effect.includes("ba-torment") ||
    announceViewed
  )
    return null;

  const type =
    data.state === "closed"
      ? "success"
      : data.category === "maintenance"
      ? "warning"
      : "error";

  const message = () => {
    if (data.state === "closed") {
      if (data.category === "maintenance") return "frontend.maintenance.closed";
      else return "frontend.incident.closed";
    } else {
      if (data.category === "maintenance") return "frontend.maintenance.open";
      else return "frontend.incident.open";
    }
  };

  return (
    <Alert
      variant="filled"
      severity={type}
      id="normal-announce"
      onClose={() => {
        window.localStorage.setItem(
          `AE_ANNOUNCE_3_1`,
          String(data.createdTime)
        );
        if (document.getElementById("normal-announce"))
          document.getElementById("normal-announce")!.style.display = "none";
      }}
      sx={{ maxWidth: "400px", margin: "0 auto", textAlign: "left" }}
    >
      <a
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <AlertTitle>{t(message())}</AlertTitle>
        <div style={{ whiteSpace: "pre-line" }}>
          {data.state === "closed" ? data.link : data.title}
        </div>
      </a>
    </Alert>
  );
}

export default NormalAnnounce;
