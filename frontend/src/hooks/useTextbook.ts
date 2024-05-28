import { useEffect, useState } from "react";

import { Textbook } from "../model/Textbook.model";
import { useGetTextbooksQuery } from "../services/api/textbook.service";

export const useTextbook = () => {
  const { data: textbook, error, isLoading } = useGetTextbooksQuery(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);

  useEffect(() => {
    setTextbooks(textbook?.data?.textbooks ?? []);
  }, [textbook]);

  return {
    textbooks,
    error,
    isLoading,
  };
};
