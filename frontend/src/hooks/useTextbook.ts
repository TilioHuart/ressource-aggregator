import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useGetTextbooksQuery } from "../services/api/textbook.service";
import { Favorite } from "~/model/Favorite.model";
import { Textbook } from "~/model/Textbook.model";

export const useTextbook = () => {
  const {
    data: textbook,
    error,
    isLoading,
    refetch: refetchTextbooks,
  } = useGetTextbooksQuery(null);
  const [textbooks, setTextbooks] = useState<Textbook[] | null>(null);
  const { favorites } = useFavorite();

  useEffect(() => {
    if (favorites) {
      let textbookData: Textbook[] = textbook?.data?.textbooks ?? [];
      textbookData = textbookData.map((textbook: Textbook) => ({
        ...textbook,
        favorite: favorites.some((fav: Favorite) => fav.id === textbook.id),
      }));

      setTextbooks(textbookData);
    }
  }, [textbook, favorites]);

  return {
    textbooks,
    setTextbooks,
    refetchTextbooks,
    error,
    isLoading,
  };
};
