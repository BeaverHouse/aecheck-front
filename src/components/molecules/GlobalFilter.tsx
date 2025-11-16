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
  const { setModal } = useModalStore();
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-[600px] flex items-center mx-auto mb-4 justify-center gap-2 px-4">
      {type !== CheckMenuOptions.buddies && (
        <Button
          variant="secondary"
          size="icon"
          aria-label="Filter Button"
          onClick={() => setModal(ModalType.filter)}
          className="w-10 h-10 flex-shrink-0"
        >
          <Filter className="h-5 w-5" />
        </Button>
      )}
      <div className="flex-grow">
        <SearchField label={t(`frontend.search.label.${type}`)} />
      </div>
    </div>
  );
};

export default GlobalFilter;
