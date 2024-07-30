import { FC, createContext, useContext, useMemo, useState } from "react";

import { ModalProviderContextType, ModalProviderProviderProps } from "./types";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Moodle } from "~/model/Moodle.model";
import { Pin } from "~/model/Pin.model";
import { SearchResource } from "~/model/SearchResource.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

const ModalProviderContext = createContext<ModalProviderContextType | null>(
  null,
);

export const useModalProvider = () => {
  const context = useContext(ModalProviderContext);
  if (!context) {
    throw new Error(
      "useModalProvider must be used within a ModalProviderProvider",
    );
  }
  return context;
};

export const ModalProvider: FC<ModalProviderProviderProps> = ({ children }) => {
  const [modalResource, setModalResource] = useState<
    Textbook | Signet | ExternalResource | Moodle | SearchResource | Pin | null
  >(null);
  const [openModal, setOpenModal] = useState<string | null>(null);

  const openSpecificModal = (modalType: string) => {
    setOpenModal(modalType);
  };

  const closeAllModals = () => {
    setOpenModal(null);
  };

  const value = useMemo<ModalProviderContextType>(
    () => ({
      modalResource,
      setModalResource,
      openModal,
      openSpecificModal,
      closeAllModals,
    }),
    [modalResource, openModal],
  );

  return (
    <ModalProviderContext.Provider value={value}>
      {children}
    </ModalProviderContext.Provider>
  );
};
