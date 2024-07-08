import { useEffect, useState } from "react";

import { useSearchQuery } from "../services/api/search.service";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Resource } from "~/model/Resource.model";
import { SearchResultCategory } from "~/model/SearchResultCategory";

export const useExternalResource = () => {
  const query = {
    state: "PLAIN_TEXT",
    data: {
      query: ".*",
    },
    event: "search",
    sources: ["fr.openent.mediacentre.source.GAR"],
  };

  const {
    data,
    error,
    isLoading,
    refetch: refetchSearch,
  } = useSearchQuery(query);

  const [externalResources, setExternalResources] = useState<
    ExternalResource[] | null
  >(null);

  useEffect(() => {
    if (data) {
      const searchResult: SearchResultCategory[] = data;
      const garResult = searchResult?.find(
        (result) => result?.data?.source == "fr.openent.mediacentre.source.GAR",
      );
      const garResources: Resource[] = garResult?.data?.resources ?? [];
      const externalResourcesData = garResources.filter(
        (resource) => !resource?.is_textbook ?? true,
      ) as ExternalResource[];
      setExternalResources(externalResourcesData);
    }
  }, [data]);

  return {
    externalResources,
    setExternalResources,
    refetchSearch,
    error,
    isLoading,
  };
};
