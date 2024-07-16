import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useUser } from "@edifice-ui/react";

import { PinProviderContextType, PinProviderProviderProps } from "./types";
import { useGetPinsQuery } from "../services/api/pin.service";
import { Pin } from "~/model/Pin.model";

const PinProviderContext = createContext<PinProviderContextType | null>(null);

export const usePinProvider = () => {
  const context = useContext(PinProviderContext);
  if (!context) {
    throw new Error("usePinProvider must be used within a PinProviderProvider");
  }
  return context;
};

export const PinProvider: FC<PinProviderProviderProps> = ({ children }) => {
  const [pins, setPins] = useState<Pin[] | null>(null);
  const { user } = useUser();

  const { data: fetchedPins, refetch: refetchPins } = useGetPinsQuery(
    (user?.structures.length ? user?.structures[0] : "") ?? "",
  );

  useEffect(() => {
    if (fetchedPins) {
      const updatedPins = fetchedPins.map((pin: Pin) => ({
        ...pin,
        is_pinned: true,
      }));
      setPins(updatedPins);
    }
  }, [fetchedPins]);

  const value = useMemo<PinProviderContextType>(
    () => ({
      pins,
      setPins,
      refetchPins,
    }),
    [pins, refetchPins],
  );

  return (
    <PinProviderContext.Provider value={value}>
      {children}
    </PinProviderContext.Provider>
  );
};
