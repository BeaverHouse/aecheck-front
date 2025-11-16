import React from "react";
import CharacterModal from "../atoms/character/Modal";
import useModalStore from "../../store/useModalStore";
import { ModalType } from "../../constants/enum";
import FilterModal from "../atoms/FilterModal";
import SettingsModal from "../atoms/SettingsModal";
import Loading from "../atoms/Loading";

interface GlobalModalProps {
  type: ModalType | undefined;
}

const GlobalModal: React.FC<GlobalModalProps> = ({ type }) => {
  const { hideModal } = useModalStore();

  const popModal = (e: PopStateEvent) => {
    e.preventDefault();
    if (type) {
      hideModal();
      window.history.go(1);
    }
  };

  React.useEffect(() => {
    window.addEventListener("popstate", popModal);
    return () => window.removeEventListener("popstate", popModal);
  });

  if (!type) {
    return null;
  } else {
    switch (type) {
      case ModalType.character:
        return <CharacterModal />;
      case ModalType.filter:
        return <FilterModal />;
      case ModalType.settings:
        return <SettingsModal />;
      case ModalType.loading:
        return <Loading />;
    }
  }
};

export default GlobalModal;
