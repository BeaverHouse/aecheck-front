import { create } from "zustand";
import { ModalType } from "../constants/enum";

interface ModalState {
  modalType?: ModalType;
  characterID: string | null;
  setModal: (type: ModalType, info?: string) => void;
  hideModal: () => void;
}

const useModalStore = create<ModalState>((set) => ({
  modalType: undefined,
  characterID: null,
  setModal: (type, info) => set({ modalType: type, characterID: info }),
  hideModal: () =>
    set({
      modalType: undefined,
      characterID: null,
    }),
}));

export default useModalStore;
