import React from "react";
import html2canvas from "html2canvas-pro";
import { Download } from "lucide-react";
import useModalStore from "../../../store/useModalStore";
import { Button } from "@/components/ui/button";
import { ModalType } from "../../../constants/enum";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
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
        backgroundColor: null,
        ignoreElements: (element) => element.id === "downloader",
      });

      element.querySelectorAll(".temporary").forEach((element) => {
        element.classList.remove("temporary");
        element.classList.add("shadow");
      });

      if (navigator.userAgent.match(/NAVER|KAKAOTALK/i)) {
        Swal.fire({
          title: "File Upload",
          html: `<p style="font-size: 14px;">${
            i18n.language === "ko"
              ? "인앱 브라우저는 서버에 파일을 업로드합니다."
              : "Image will be downloaded after uploading to the server."
          }</p>`,
          width: 300,
          showCancelButton: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            canvas.toBlob(async (blob) => {
              try {
                if (!blob) {
                  hideModal();
                  return window.alert("!!!");
                }

                const formData = new FormData();
                const fileName = `${Date.now().toString()}.jpg`;
                formData.append("file", blob, fileName);

                const uploadURL = `https://api.tinyclover.com/file-manager/v1/files/upload/user-image`;
                const res = await fetch(uploadURL, {
                  method: "POST",
                  headers: {
                    "X-Access-Token": process.env.NEXT_PUBLIC_API_KEY!,
                  },
                  body: formData,
                  signal: AbortSignal.timeout(15000),
                });
                const response = (await res.json()) as APIResponse<{
                  file_name: string;
                  file_size: number;
                  file_url: string;
                  s3_path: string;
                }>;
                const link = document.createElement("a");

                document.body.appendChild(link);

                link.href = response.data.file_url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.click();
                hideModal();
              } catch (error) {
                console.error("Upload error:", error);
                hideModal();
                AnnounceSwal.fire({
                  icon: "error",
                  title: "Image Upload Error",
                  text: "Please try again later.",
                  confirmButtonText: "Ok",
                });
              }
            }, "image/jpeg", 0.95);
          } else {
            hideModal();
          }
        });
      } else {
        canvas.toBlob((blob) => {
          if (!blob) {
            hideModal();
            return window.alert("!!!");
          }
          saveAs(blob, `${Date.now().toString()}${isIOS ? "" : ".jpg"}`);
          hideModal();
        }, "image/jpeg", 0.95);
      }
    } catch (error) {
      console.error("Download error:", error);
      hideModal();
      AnnounceSwal.fire({
        icon: "error",
        title: "Image Download Error",
        text: "Please try again later.",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      aria-label="Download Button"
      id="downloader"
      onClick={handleSaveClick}
      className="m-0.5 mr-1 ml-2 min-w-10 min-h-10 rounded-full"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
};

export default DownloadButton;
