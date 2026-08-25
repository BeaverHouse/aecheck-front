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

const DESKTOP_CAPTURE_WIDTH = 1200;
const CAPTURE_SCALE = 1.1;
const CAPTURE_BATCH_SIZE = 100;
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Captures the element once with every image blanked out and once per batch of images,
 * then merges each batch pass into the blank one wherever their pixels differ.
 *
 * html2canvas reloads every image it draws and tears its clone down while those loads
 * are still running: a capture holding 250 image elements lost about 150 of them and
 * the matching character cards came out blank, one holding 139 lost 4, and one holding
 * 32 lost none. Batching the images around that limit is the way out, but the passes
 * cannot be stitched by rectangle: the capture lays the page out a little differently
 * from the live DOM, and copies placed at the live coordinates drifted further off with
 * every section. Comparing pixels needs no coordinates at all, and it works because the
 * passes differ in nothing but which images carry their picture.
 */
const captureInBatches = async (
  element: HTMLElement,
  options: Parameters<typeof html2canvas>[1]
) => {
  const images = Array.from(element.querySelectorAll("img"));
  if (images.length <= CAPTURE_BATCH_SIZE) return html2canvas(element, options);

  const undos: Array<() => void> = [];

  const blank = (target: Element, attribute: string) => {
    const original = target.getAttribute(attribute);
    // A <source> can be reached through more than one image, and blanking it twice
    // would record the blank as the value to restore and leave the page without that
    // picture after the download.
    if (original === null || original === TRANSPARENT_PIXEL) return;
    undos.push(() => target.setAttribute(attribute, original));
    target.setAttribute(attribute, TRANSPARENT_PIXEL);
  };

  const hide = (batch: Set<Element>) => {
    images.forEach((image) => {
      if (batch.has(image)) return;
      image.parentElement
        ?.querySelectorAll("source")
        .forEach((variant) => blank(variant, "srcset"));
      blank(image, "src");
    });
  };

  const reveal = () => {
    undos.forEach((undo) => undo());
    undos.length = 0;
  };

  // Every image keeps the box it was measured at, because a blanked image that draws its
  // own height would collapse and move everything below it out of step with the other
  // passes.
  const pinned: Array<() => void> = [];
  images.forEach((image) => {
    const rect = image.getBoundingClientRect();
    const style = image.getAttribute("style");
    pinned.push(() => {
      if (style === null) image.removeAttribute("style");
      else image.setAttribute("style", style);
    });
    image.setAttribute(
      "style",
      `${style ?? ""};width:${rect.width}px;height:${rect.height}px`
    );
  });

  try {
    hide(new Set());
    const merged: HTMLCanvasElement = await html2canvas(element, options);
    reveal();

    const context = merged.getContext("2d");
    if (!context) return merged;

    const target = context.getImageData(0, 0, merged.width, merged.height);
    const blankPixels = new Uint8ClampedArray(target.data);

    for (let index = 0; index < images.length; index += CAPTURE_BATCH_SIZE) {
      const batch = new Set<Element>(images.slice(index, index + CAPTURE_BATCH_SIZE));

      hide(batch);
      let pass: HTMLCanvasElement;
      try {
        pass = await html2canvas(element, options);
      } finally {
        reveal();
      }

      const passContext = pass.getContext("2d");
      if (!passContext) continue;

      const pixels = passContext.getImageData(0, 0, pass.width, pass.height).data;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (
          pixels[offset] === blankPixels[offset] &&
          pixels[offset + 1] === blankPixels[offset + 1] &&
          pixels[offset + 2] === blankPixels[offset + 2] &&
          pixels[offset + 3] === blankPixels[offset + 3]
        ) {
          continue;
        }

        target.data[offset] = pixels[offset];
        target.data[offset + 1] = pixels[offset + 1];
        target.data[offset + 2] = pixels[offset + 2];
        target.data[offset + 3] = pixels[offset + 3];
      }
    }

    context.putImageData(target, 0, 0);

    return merged;
  } finally {
    reveal();
    pinned.forEach((undo) => undo());
  }
};

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

    // GA4 다운로드 이벤트 추적
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download_image', {
        event_category: 'engagement',
        event_label: tag,
      });
    }

    setModal(ModalType.loading);
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    try {
      // Detect dark mode and set appropriate background color
      const isDark = document.documentElement.classList.contains('dark');

      // The avatar grid fills its container, so a phone keeps its narrow column count
      // unless the element is widened to the desktop layout before it is measured.
      if (tag === "ae-wrapper") {
        element.style.width = `${DESKTOP_CAPTURE_WIDTH}px`;
        element.style.maxWidth = "none";
      }

      const captureWidth = element.scrollWidth;
      const captureHeight = element.scrollHeight;

      const canvas = await captureInBatches(element, {
        scale: CAPTURE_SCALE,
        allowTaint: true,
        useCORS: true,
        width: captureWidth,
        height: captureHeight,
        backgroundColor: isDark ? '#171717' : '#ffffff',
        ignoreElements: (element) => element.id === "downloader",
        onclone: (_: Document, clonedElement: HTMLElement) => {
          clonedElement.style.width = `${captureWidth}px`;
          clonedElement.style.height = `${captureHeight}px`;
          clonedElement.style.maxHeight = "none";
          clonedElement.style.overflow = "visible";
          clonedElement.scrollLeft = 0;
          clonedElement.scrollTop = 0;

          const highlights = [
            {
              selector: '[data-capture-highlight="recent"], .glow-recent',
              border: "2px solid #56b4e9",
            },
            {
              selector: '[data-capture-highlight="op"], .glow-op',
              border: "2px solid rgba(250, 204, 21, 0.8)",
            },
            {
              selector: '[data-capture-highlight="super_op"], .glow-super-op',
              border: "4px solid #fde047",
            },
          ];

          highlights.forEach(({ selector, border }) => {
            clonedElement.querySelectorAll<HTMLElement>(selector).forEach((highlighted) => {
              highlighted.style.setProperty("box-shadow", "none", "important");
              const position = highlighted.ownerDocument.defaultView
                ?.getComputedStyle(highlighted).position;
              if (!position || position === "static") {
                highlighted.style.position = "relative";
              }

              const overlay = highlighted.ownerDocument.createElement("div");
              Object.assign(overlay.style, {
                position: "absolute",
                inset: "0",
                border,
                borderRadius: "inherit",
                boxSizing: "border-box",
                pointerEvents: "none",
                zIndex: "5",
              });
              highlighted.appendChild(overlay);
            });
          });
        },
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
                  return Swal.fire({ icon: "error", text: "Image error", width: 280, timer: 1500, showConfirmButton: false });
                }

                const formData = new FormData();
                const fileName = `${Date.now().toString()}.jpg`;
                formData.append("file", blob, fileName);
                formData.append("upload_path", "user-image");

                const uploadURL = `https://api.tinyclover.com/file-manager/v1/files/upload`;
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
              } catch {
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
            return Swal.fire({ icon: "error", text: "Image error", width: 280, timer: 1500, showConfirmButton: false });
          }
          saveAs(blob, `${Date.now().toString()}${isIOS ? "" : ".jpg"}`);
          hideModal();
        }, "image/jpeg", 0.95);
      }
    } catch {
      hideModal();
      AnnounceSwal.fire({
        icon: "error",
        title: "Image Download Error",
        text: "Please try again later.",
        confirmButtonText: "Ok",
      });
    } finally {
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
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
