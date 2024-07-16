import { useCallback, useEffect, useState } from "react";

import { useUser } from "@edifice-ui/react";

import { Signet } from "./../model/Signet.model";
import {
  useGetPublishedSignetsQuery,
  useGetMySignetsQuery,
} from "./../services/api/signet.service";
import { useFavorite } from "./useFavorite";
import { Favorite } from "~/model/Favorite.model";
import { Pin } from "~/model/Pin.model";
import { usePinProvider } from "~/providers/PinProvider";

export const useSignet = () => {
  const { user } = useUser();
  const { pins } = usePinProvider();
  const {
    data: publicSignets,
    error: publicSignetError,
    isLoading: publicSignetIsLoading,
  } = useGetPublishedSignetsQuery(null);
  const {
    data: mySignets,
    error: mySignetError,
    isLoading: mySignetIsLoading,
  } = useGetMySignetsQuery(null);
  const [homeSignets, setHomeSignets] = useState<Signet[] | null>(null);
  const { favorites } = useFavorite();

  const getHomeSignets = useCallback(() => {
    if (!publicSignets || !mySignets) {
      return null;
    }
    const publicSignetsData: Signet[] =
      publicSignets?.data?.signets?.resources ?? [];
    const mySignetsData: Signet[] = mySignets
      ? mySignets.filter((signet: Signet) => signet.owner_id != user?.userId)
      : [];
    const updatedMySignetsData: Signet[] = mySignetsData.map(
      (signet: Signet) => ({
        ...signet,
        shared: false,
      }),
    );
    const updatedPublicSignetsData: Signet[] = publicSignetsData.map(
      (signet: Signet) => ({
        ...signet,
        orientation: signet?.document_types?.some((type) =>
          type.toLowerCase().includes("orientation"),
        ),
        shared: true,
      }),
    );
    let signetsData: Signet[] = [
      ...updatedPublicSignetsData,
      ...updatedMySignetsData,
    ];
    if (favorites) {
      signetsData = signetsData.map((signet: Signet) => ({
        ...signet,
        favorite: favorites.some((fav: Favorite) =>
          signet?.id
            ? fav?.id?.toString() === signet?.id
            : fav?.id?.toString() === signet?._id,
        ),
      }));
    }
    if (pins) {
      signetsData = signetsData.map((signet: Signet) => ({
        ...signet,
        is_pinned: pins.some(
          (pin: Pin) =>
            pin?.id == signet?.id &&
            pin.source === "fr.openent.mediacentre.source.Signet",
        ),
      }));
    }
    return signetsData;
  }, [favorites, mySignets, publicSignets, user?.userId, pins]);

  useEffect(() => {
    if (favorites && pins) {
      const signetsData = getHomeSignets();
      setHomeSignets(signetsData);
    }
  }, [
    publicSignets,
    mySignets,
    user?.userId,
    favorites,
    pins,
    setHomeSignets,
    getHomeSignets,
  ]);

  return {
    homeSignets,
    setHomeSignets,
    getHomeSignets,
    publicSignetError,
    publicSignetIsLoading,
    mySignetError,
    mySignetIsLoading,
  };
};
