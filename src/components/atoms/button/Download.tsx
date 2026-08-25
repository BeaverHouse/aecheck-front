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
const HIGHLIGHTS = [
  {
    selector: '[data-capture-highlight="recent"], .glow-recent',
    width: 2,
    color: "#56b4e9",
  },
  {
    selector: '[data-capture-highlight="op"], .glow-op',
    width: 2,
    color: "rgba(250, 204, 21, 0.8)",
  },
  {
    selector: '[data-capture-highlight="super_op"], .glow-super-op',
    width: 4,
    color: "#fde047",
  },
];
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

interface CaptureImage {
  bitmap: HTMLCanvasElement;
  element: HTMLImageElement;
  layer: number;
}

/**
 * Captures the element with every image blanked out and paints the pictures the page has
 * already decoded onto the result.
 *
 * html2canvas reloads each image it draws instead of reusing the decoded one, and it
 * tears its clone down while those loads are still running: a capture holding 250 images
 * lost about 150 of them and the matching character cards came out blank, while one
 * holding 32 lost none. Pointing every image at the same blank pixel leaves the capture
 * with a single picture to load, and the real ones are drawn afterwards from the canvas
 * copies taken here. That copying is what the crossOrigin attribute on the images is
 * for: a canvas holding a plain cross-origin picture cannot be read back.
 */
const captureWithImages = async (
  element: HTMLElement,
  options: Parameters<typeof html2canvas>[1] & { scale: number }
) => {
  const undos: Array<() => void> = [];
  const set = (target: Element, attribute: string, value: string) => {
    const original = target.getAttribute(attribute);
    if (original === null || original === value) return;
    undos.push(() => target.setAttribute(attribute, original));
    target.setAttribute(attribute, value);
  };

  const bitmaps = new Map<string, HTMLCanvasElement>();
  const drawings: CaptureImage[] = [];

  element.querySelectorAll("img").forEach((image) => {
    const rect = image.getBoundingClientRect();
    // A blanked image that draws its own height would collapse and move everything
    // below it away from the boxes measured here.
    set(
      image,
      "style",
      `${image.getAttribute("style") ?? ""};width:${rect.width}px;height:${rect.height}px`
    );

    if (image.naturalWidth) {
      let bitmap = bitmaps.get(image.src);
      if (!bitmap) {
        bitmap = document.createElement("canvas");
        bitmap.width = image.naturalWidth;
        bitmap.height = image.naturalHeight;
        bitmap.getContext("2d")?.drawImage(image, 0, 0);
        bitmaps.set(image.src, bitmap);
      }

      const layer = Number(window.getComputedStyle(image).zIndex);
      drawings.push({ bitmap, element: image, layer: Number.isNaN(layer) ? 0 : layer });
    }

    // A <source> outranks the img's own src, so the WebP variants go blank as well.
    // Only the image's own picture may be touched: reaching further up blanked the
    // character art before its copy was taken, and every card came out empty.
    image
      .closest("picture")
      ?.querySelectorAll(":scope > source")
      .forEach((variant) => set(variant, "srcset", TRANSPARENT_PIXEL));
    set(image, "src", TRANSPARENT_PIXEL);
  });

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, options);
  } finally {
    undos.forEach((undo) => undo());
  }

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  // The capture leaves its own scale on the context, which multiplied every coordinate
  // below a second time and pushed the pictures further down the page the lower they sat.
  context.setTransform(1, 0, 0, 1, 0, 0);

  const bounds = element.getBoundingClientRect();
  const place = (target: Element) => {
    const rect = target.getBoundingClientRect();
    return {
      x: (rect.left - bounds.left) * options.scale,
      y: (rect.top - bounds.top) * options.scale,
      width: rect.width * options.scale,
      height: rect.height * options.scale,
    };
  };

  // The capture holds the name plates and the highlight rings, which belong above the
  // pictures, so it is kept aside and those parts are put back afterwards.
  const captured = document.createElement("canvas");
  captured.width = canvas.width;
  captured.height = canvas.height;
  captured.getContext("2d")?.drawImage(canvas, 0, 0);

  const restore = (x: number, y: number, width: number, height: number) => {
    if (width <= 0 || height <= 0) return;
    context.drawImage(captured, x, y, width, height, x, y, width, height);
  };

  drawings
    .sort((first, second) => first.layer - second.layer)
    .forEach(({ bitmap, element: image }) => {
      const box = place(image);
      const style = window.getComputedStyle(image);

      context.save();
      context.filter = style.filter;
      context.globalAlpha = Number(style.opacity);
      context.beginPath();
      context.roundRect(
        box.x,
        box.y,
        box.width,
        box.height,
        parseFloat(style.borderTopLeftRadius) * options.scale || 0
      );
      context.clip();
      context.drawImage(bitmap, box.x, box.y, box.width, box.height);
      context.restore();
    });

  element.querySelectorAll("picture").forEach((picture) => {
    const plate = picture.nextElementSibling;
    if (!plate) return;
    const box = place(plate);
    restore(box.x, box.y, box.width, box.height);
  });

  HIGHLIGHTS.forEach(({ selector, width }) => {
    const ring = width * options.scale;
    element.querySelectorAll(selector).forEach((highlighted) => {
      const box = place(highlighted);
      restore(box.x, box.y, box.width, ring);
      restore(box.x, box.y + box.height - ring, box.width, ring);
      restore(box.x, box.y, ring, box.height);
      restore(box.x + box.width - ring, box.y, ring, box.height);
    });
  });

  return canvas;
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

      const canvas = await captureWithImages(element, {
        scale: CAPTURE_SCALE,
        allowTaint: true,
        useCORS: true,
        width: captureWidth,
        height: captureHeight,
        backgroundColor: isDark ? '#171717' : '#ffffff',
        onclone: (_: Document, clonedElement: HTMLElement) => {
          // The button is hidden rather than dropped from the capture: dropping it took
          // its height out of the layout, and everything below sat about 30px higher
          // than the page it was measured from.
          const downloader = clonedElement.querySelector<HTMLElement>("#downloader");
          if (downloader) downloader.style.visibility = "hidden";

          clonedElement.style.width = `${captureWidth}px`;
          clonedElement.style.height = `${captureHeight}px`;
          clonedElement.style.maxHeight = "none";
          clonedElement.style.overflow = "visible";
          clonedElement.scrollLeft = 0;
          clonedElement.scrollTop = 0;

          HIGHLIGHTS.forEach(({ selector, width, color }) => {
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
                border: `${width}px solid ${color}`,
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
