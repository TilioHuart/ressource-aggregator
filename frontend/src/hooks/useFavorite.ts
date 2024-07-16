import { useEffect, useState } from "react";

import { Favorite } from "./../model/Favorite.model";
import { useGetFavoriteQuery } from "./../services/api/favorite.service";
import { Pin } from "~/model/Pin.model";
import { usePinProvider } from "~/providers/PinProvider";

export const useFavorite = () => {
  const { pins } = usePinProvider();
  const {
    data: favorite,
    error,
    isLoading,
    refetch: refetchFavorite,
  } = useGetFavoriteQuery(null);
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);

  useEffect(() => {
    if (favorite) {
      let favoriteData: Favorite[] =
        favorite?.data?.length > 0 ? favorite.data : [] ?? [];
      favoriteData = favoriteData.map((favorite: Favorite) => ({
        ...favorite,
        favorite: true,
      }));
      if (pins) {
        favoriteData = favoriteData.map((favorite: Favorite) => ({
          ...favorite,
          is_pinned: pins.some(
            (pin: Pin) =>
              pin?.id == favorite?.id && pin.source === favorite?.source,
          ),
        }));
      }
      setFavorites(favoriteData);
    }
  }, [favorite, pins]);

  return { favorites, setFavorites, refetchFavorite, error, isLoading };
};
