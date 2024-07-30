import { Dispatch, ReactNode, SetStateAction } from "react";

import { AlertTypes } from "@edifice-ui/react";
import {
  FetchArgs,
  QueryActionCreatorResult,
  QueryDefinition,
  BaseQueryFn,
  FetchBaseQueryMeta,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { ExternalResource } from "~/model/ExternalResource.model";
import { Moodle } from "~/model/Moodle.model";
import { Pin } from "~/model/Pin.model";
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

export interface PinProviderProviderProps {
  children: ReactNode;
}

export type PinProviderContextType = {
  pins: Pin[] | null;
  setPins: Dispatch<SetStateAction<Pin[] | null>>;
  refetchPins: () => QueryActionCreatorResult<
    QueryDefinition<
      string,
      BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        {},
        FetchBaseQueryMeta
      >,
      never,
      any,
      "api"
    >
  >;
};

export interface SelectedStructureProviderProviderProps {
  children: ReactNode;
}

export type SelectedStructureProviderContextType = {
  nameSelectedStructure: string;
  setNameSelectedStructure: Dispatch<SetStateAction<string>>;
  idSelectedStructure: string;
};
