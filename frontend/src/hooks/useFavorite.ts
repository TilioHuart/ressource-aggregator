import { useEffect, useState } from "react";

import { Favorite } from "./../model/Favorite.model";
import { useGetFavoriteQuery } from "./../services/api/favorite.service";

export const useFavorite = () => {
  const { data: favorite, error, isLoading } = useGetFavoriteQuery(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setFavorites(favorite?.data?.length >= 0 ? favorite.data : [] ?? []);
  }, [favorite]);

  return { favorites, error, isLoading };
};
