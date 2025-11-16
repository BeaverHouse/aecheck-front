import { useTranslation } from "react-i18next";
import { RefreshCw, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageButton from "../atoms/button/Language";

function ErrorPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow overflow-auto flex flex-col items-center justify-center">
      <h2 className="m-4 text-xl font-semibold">
        {t("frontend.server.error")}
      </h2>
      <img src="/error.png" alt="error" className="w-[200px]" />
      <div className="my-8 flex gap-4 flex-wrap justify-center">
        <Button
          variant="default"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          Refresh
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          asChild
        >
          <a
            href="https://status.haulrest.me/status/overall"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            API Status
            <Info className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="default"
          asChild
        >
          <a
            href="mailto:haulrest@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            E-mail
            <Mail className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <div className="my-8">
        <LanguageButton />
      </div>
    </div>
  );
}

export default ErrorPage;
