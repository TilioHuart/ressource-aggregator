import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useGetTextbooksQuery } from "../services/api/textbook.service";
import { Favorite } from "~/model/Favorite.model";
import { Textbook } from "~/model/Textbook.model";

export const useTextbook = () => {
  const { data: textbook, error, isLoading } = useGetTextbooksQuery(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
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
    error,
    isLoading,
  };
};
