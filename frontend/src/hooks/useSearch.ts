import { useEffect, useState } from "react";

import { useSearchQuery } from "../services/api/search.service";
import { Resource } from "~/model/Resource.model";

export const useSearch = (query: any) => {
  const [searchResult, setSearchResult] = useState<Resource[]>([]);
  const { data, error, isLoading } = useSearchQuery(query);

  useEffect(() => {
    if (data) {
      setSearchResult(data);
    }
  }, [data]);

  return { searchResult, error, isLoading };
};
