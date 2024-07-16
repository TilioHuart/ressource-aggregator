import { useEffect, useState } from "react";

import { useGetGlobalQuery } from "./../services/api/global.service";
import { useFavorite } from "./useFavorite";
import { Favorite } from "~/model/Favorite.model";
import { GlobalResource } from "~/model/GlobalResource.model";
import { Pin } from "~/model/Pin.model";
import { usePinProvider } from "~/providers/PinProvider";

export const useGlobal = () => {
  const { pins } = usePinProvider();
  const { data: global, error, isLoading } = useGetGlobalQuery(null);
  const [globals, setGlobals] = useState<GlobalResource[] | null>(null);
  const { favorites } = useFavorite();

  useEffect(() => {
    let globalData: GlobalResource[] = global?.data?.global ?? [];
    if (favorites && global) {
      globalData = globalData.map((global: GlobalResource) => ({
        ...global,
        favorite: favorites.some((fav: Favorite) => fav._id === global._id),
      }));
    }
    if (pins) {
      globalData = globalData.map((global: GlobalResource) => ({
        ...global,
        is_pinned: pins.some(
          (pin: Pin) =>
            pin?.id === global?._id &&
            pin.source === "fr.openent.mediacentre.source.GAR",
        ),
      }));
    }
    setGlobals(globalData);
  }, [global, favorites, pins]);

  return { globals, setGlobals, error, isLoading };
};
