"use client";

import "@/i18n";
import GlobalModal from "@/components/molecules/GlobalModal";
import useModalStore from "@/store/useModalStore";
import useConfigStore from "@/store/useConfigStore";
import useCheckStore from "@/store/useCheckStore";
import { ThemeOptions } from "@/constants/enum";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AECheckMenu from "@/components/organisms/Menu";
import NormalAnnounce from "@/components/atoms/button/NormalAnnounce";
import ScrollTop from "@/components/atoms/button/ScrollTop";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { getNumber } from "@/util/func";
import { cn } from "@/lib/utils";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, colorBlindMode } = useConfigStore();
  const { modalType } = useModalStore();
  const { t } = useTranslation();
  const { loadSaveData } = useCheckStore();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnMount: false, // Don't refetch on component mount if data is fresh
        retry: 1, // Retry failed requests once
      },
    },
  });

  const migrate = async () => {
    const oldData = window.localStorage.getItem("AE_CHECK");
    if (!oldData || oldData.length < 1) return;
    Swal.fire({
      title: "Data Migration",
      html: `<p style="font-size: 14px;">${t("frontend.message.migrate")}</p>`,
      width: 300,
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newData: CheckStateV4 = JSON.parse(oldData).state;
          if (!newData.buddy) {
            const charIds = newData.inven.map(
              (i) => `char${String(i).padStart(4, "0")}`
            );
            const body = {
              characterIds: charIds,
            };
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/buddy/partners`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
              }
            );
            const buddyList = (
              (await res.json()) as APIResponse<IDInfo[]>
            ).data.map((i) => getNumber(i));

            newData.buddy = buddyList;
          }
          loadSaveData(newData);
          Swal.fire({
            text: "Data Load Success",
            width: 280,
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
            customClass: {
              popup: "alert",
            },
          }).then(() => {
            window.localStorage.removeItem("AE_CHECK");
            window.location.reload();
          });
        } catch {
          Swal.fire({
            text: "Data Load Error",
            width: 280,
            timer: 1000,
            showConfirmButton: false,
            timerProgressBar: true,
            customClass: {
              popup: "alert",
            },
          });
        }
      }
    });
  };

  useEffect(() => {
    if (t("frontend.message.migrate") !== "frontend.message.migrate") migrate();
  }, []);

  // Apply dark mode and color blind mode classes
  useEffect(() => {
    if (theme === ThemeOptions.dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (colorBlindMode) {
      document.documentElement.classList.add('color-blind');
    } else {
      document.documentElement.classList.remove('color-blind');
    }
  }, [colorBlindMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={cn("min-h-screen bg-background text-foreground")}>
        <GlobalModal type={modalType} />
        <AECheckMenu />
        <NormalAnnounce />
        <div id="back-to-top-anchor" />
        {children}
        <ScrollTop>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            aria-label="scroll back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </ScrollTop>
      </div>
    </QueryClientProvider>
  );
}
