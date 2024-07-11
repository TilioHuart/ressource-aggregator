import { Dispatch, ReactNode, SetStateAction } from "react";

import { AlertTypes } from "@edifice-ui/react";

import { ExternalResource } from "~/model/ExternalResource.model";
import { Moodle } from "~/model/Moodle.model";
import { SearchResource } from "~/model/SearchResource.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

export interface ModalProviderProviderProps {
  children: ReactNode;
}

export type ModalProviderContextType = {
  modalResource:
    | Textbook
    | Signet
    | ExternalResource
    | Moodle
    | SearchResource
    | null;
  setModalResource: Dispatch<
    SetStateAction<
      Textbook | Signet | ExternalResource | Moodle | SearchResource | null
    >
  >;
  isCreatedOpen: boolean;
  setIsCreatedOpen: Dispatch<SetStateAction<boolean>>;
  isEditOpen: boolean;
  setIsEditOpen: Dispatch<SetStateAction<boolean>>;
  isDeleteOpen: boolean;
  setIsDeleteOpen: Dispatch<SetStateAction<boolean>>;
};

export interface AlertProviderProviderProps {
  children: ReactNode;
}

export type AlertProviderContextType = {
  alertText: string;
  setAlertText: Dispatch<SetStateAction<string>>;
  alertType: AlertTypes;
  setAlertType: Dispatch<SetStateAction<AlertTypes>>;
};
