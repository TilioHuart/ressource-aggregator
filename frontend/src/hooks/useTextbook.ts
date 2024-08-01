import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useGetTextbooksQuery } from "../services/api/textbook.service";
import { Favorite } from "~/model/Favorite.model";
import { Pin } from "~/model/Pin.model";
import { Textbook } from "~/model/Textbook.model";
import { usePinProvider } from "~/providers/PinProvider";

export const useTextbook = (idStructure: string) => {
  const { pins } = usePinProvider();
  const {
    data: textbook,
    error,
    isLoading,
    refetch: refetchTextbooks,
  } = useGetTextbooksQuery(idStructure);
  const [textbooks, setTextbooks] = useState<Textbook[] | null>(null);
  const { favorites } = useFavorite();

  useEffect(() => {
    refetchTextbooks();
  }, [idStructure]);

  useEffect(() => {
    let textbookData: Textbook[] = textbook?.data?.textbooks ?? [];
    if (favorites) {
      textbookData = textbookData.map((textbook: Textbook) => ({
        ...textbook,
        favorite: favorites.some((fav: Favorite) => fav.id === textbook.id),
      }));
    }
    if (pins) {
      textbookData = textbookData.map((textbook: Textbook) => ({
        ...textbook,
        is_pinned: pins.some(
          (pin: Pin) =>
            pin?.id === textbook?.id &&
            pin.source === "fr.openent.mediacentre.source.GAR",
        ),
      }));
    }
    setTextbooks(textbookData);
  }, [textbook, favorites, pins]);

  return {
    textbooks,
    setTextbooks,
    refetchTextbooks,
    error,
    isLoading,
  };
};
