import { useEffect, useState } from "react";

import { useSearchQuery } from "../services/api/search.service";
import { SearchResource } from "~/model/SearchResource.model";
import { SearchResultCategory } from "~/model/SearchResultCategory.model";

export const useSearch = (query: any) => {
  const [allResources, setAllResources] = useState<SearchResource[]>([]);
  const { data, error, isLoading } = useSearchQuery(query);

  useEffect(() => {
    if (data) {
      const resources: SearchResource[] = [];
      const searchResult: SearchResultCategory[] = data;
      searchResult.forEach((category) => {
        category.data.resources.forEach((resource) => {
          resources.push(resource);
        });
      });
      setAllResources(resources);
    }
  }, [data]);

  return { allResources, error, isLoading };
};
