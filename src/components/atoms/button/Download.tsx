import React from "react";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import useTheme from "@mui/material/styles/useTheme";
import useModalStore from "../../../store/useModalStore";
import Fab from "@mui/material/Fab";
import { ModalType } from "../../../constants/enum";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import saveAs from "file-saver";
import { isIOS } from "react-device-detect";

const AnnounceSwal = withReactContent(Swal);

interface DownloadProps {
  tag: string;
}

/**
 * Downloader
 *
 * 특정 태그가 달린 div 영역을 이미지로 다운로드할 수 있게 합니다.
 * 일부 기기에서 동작하지 않을 수도 있습니다.
 *
 * @param tag
 */
const DownloadButton: React.FC<DownloadProps> = ({ tag }) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const { setModal, hideModal } = useModalStore();

  const handleSaveClick = async () => {
    const element = document.getElementById(tag);
    if (!element) return;
    setModal(ModalType.loading);
    try {
      element.querySelectorAll(".shadow").forEach((element) => {
        element.classList.remove("shadow");
        element.classList.add("temporary");
      });
      const canvas = await html2canvas(element, {
        scale: 1.1,
        allowTaint: true,
        useCORS: true,
        windowWidth: tag === "ae-wrapper" ? 1200 : element.clientWidth,
        backgroundColor: theme.palette.background.paper,
        ignoreElements: (element) => element.id === "downloader",
      });

      element.querySelectorAll(".temporary").forEach((element) => {
        element.classList.remove("temporary");
        element.classList.add("shadow");
      });
      
      if (navigator.userAgent.match(/NAVER|KAKAOTALK/i)) {
        Swal.fire({
          title: "Data Migration",
          html: `<p style="font-size: 14px;">${
            i18n.language === "ko"
              ? "인앱 브라우저는 서버에 파일을 업로드합니다."
              : "Image will be downloaded after uploading to the server."
          }</p>`,
          width: 300,
          showCancelButton: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            const body = {
              file: canvas.toDataURL("image/jpeg"),
            };
    
            const uploadURL = `https://api.haulrest.me/file/aecheck`;
            const res = await fetch(uploadURL, {
              method: "POST",
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
              },
              body: JSON.stringify(body),
              signal: AbortSignal.timeout(15000),
            });
            const url = ((await res.json()) as APIResponse<string>).data;
            const link = document.createElement("a");
    
            document.body.appendChild(link);
    
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.click();
          }
        });
      } else {
        canvas.toBlob((blob) => {
          if (!blob) {
            return window.alert("!!!");
          }
          saveAs(blob, `${Date.now().toString()}${isIOS ? "" : ".jpg"}`);
        });
      }
    } catch {
      AnnounceSwal.fire({
        icon: "error",
        title: "Image Download Error",
        text: "Please try again later.",
        confirmButtonText: "Ok",
        confirmButtonColor: theme.palette.primary.main,
      });
    } finally {
      hideModal();
    }
  };

  return (
    <Fab
      aria-label="Download Button"
      id="downloader"
      color="secondary"
      onClick={handleSaveClick}
      size="small"
      sx={{ m: 0.5, mr: 1, ml: 2, minWidth: 40, minHeight: 40 }}
    >
      <DownloadIcon />
    </Fab>
  );
};

export default DownloadButton;
