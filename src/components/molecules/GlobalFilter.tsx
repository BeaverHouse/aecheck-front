import React from "react";
import useModalStore from "../../store/useModalStore";
import { Filter } from "lucide-react";
import { ModalType, CheckMenuOptions } from "../../constants/enum";
import SearchField from "../atoms/SearchField";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface GlobalFilterProps {
  type: CheckMenuOptions;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ type }) => {
  const setModal = useModalStore((state) => state.setModal);
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-[600px] flex items-center mx-auto mb-2 justify-center gap-2 px-4">
      {type !== CheckMenuOptions.buddies && (
        <Button
          variant="outline"
          onClick={() => setModal(ModalType.filter)}
          className="h-10 shrink-0 px-3 text-foreground"
        >
          <Filter />
          {t("filter.button")}
        </Button>
      )}
      <div className="min-w-0 flex-grow">
        <SearchField label={t(`frontend.search.label.${type}`)} />
      </div>
    </div>
  );
};

export default GlobalFilter;
