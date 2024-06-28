import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useGetTextbooksQuery } from "../services/api/textbook.service";
import { Favorite } from "~/model/Favorite.model";
import { Textbook } from "~/model/Textbook.model";

export const useTextbook = () => {
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const {
    data: textbook,
    error,
    isLoading,
    refetch: refetchTextbooks,
  } = useGetTextbooksQuery(null);
  const [textbooks, setTextbooks] = useState<Textbook[] | null>(null);
  const { favorites } = useFavorite();

  const selectDisciplines = (textbooks: Textbook[]) => {
    const disciplines: string[] = [];

    textbooks.forEach((textbook) => {
      if (textbook.disciplines) {
        textbook.disciplines.forEach((discipline) => {
          if (!disciplines.includes(discipline)) {
            disciplines.push(discipline);
          }
        });
      }
    });

    setDisciplines(disciplines);
  };

  const selectLevels = (textbooks: Textbook[]) => {
    const levels: string[] = [];

    textbooks.forEach((textbook) => {
      if (textbook.levels) {
        textbook.levels.forEach((level) => {
          if (!levels.includes(level)) {
            levels.push(level);
          }
        });
      }
    });

    setLevels(levels);
  };

  useEffect(() => {
    if (favorites) {
      let textbookData: Textbook[] = textbook?.data?.textbooks ?? [];
      textbookData = textbookData.map((textbook: Textbook) => ({
        ...textbook,
        favorite: favorites.some((fav: Favorite) => fav.id === textbook.id),
      }));
      selectDisciplines(textbookData);
      selectLevels(textbookData);

      setTextbooks(textbookData);
    }
  }, [textbook, favorites]);

  return {
    textbooks,
    setTextbooks,
    refetchTextbooks,
    disciplines,
    levels,
    error,
    isLoading,
  };
};
