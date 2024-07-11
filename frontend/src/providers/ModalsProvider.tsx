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
  const [isCreatedOpen, setIsCreatedOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const value = useMemo<ModalProviderContextType>(
    () => ({
      modalResource,
      setModalResource,
      isCreatedOpen,
      setIsCreatedOpen,
      isEditOpen,
      setIsEditOpen,
      isDeleteOpen,
      setIsDeleteOpen,
    }),
    [modalResource, isCreatedOpen, isEditOpen, isDeleteOpen],
  );

  return (
    <ModalProviderContext.Provider value={value}>
      {children}
    </ModalProviderContext.Provider>
  );
};
