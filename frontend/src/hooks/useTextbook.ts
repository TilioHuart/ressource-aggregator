import { useEffect, useState } from "react";

import { useGetTextbooksQuery } from "../services/api/textbook.service";
import { Textbook } from "~/model/Textbook.model";

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
