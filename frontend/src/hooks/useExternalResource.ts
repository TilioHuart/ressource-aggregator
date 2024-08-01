import { useEffect, useState } from "react";

import { useSearchQuery } from "../services/api/search.service";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Pin } from "~/model/Pin.model";
import { Resource } from "~/model/Resource.model";
import { SearchResultCategory } from "~/model/SearchResultCategory";
import { usePinProvider } from "~/providers/PinProvider";

export const useExternalResource = (idStructure: string) => {
  const { pins } = usePinProvider();
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
  } = useSearchQuery({ jsondata: query, idStructure });

  useEffect(() => {
    refetchSearch();
  }, [idStructure]);

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
      let externalResourcesData = garResources.filter(
        (resource) => !resource?.is_textbook ?? true,
      ) as ExternalResource[];
      if (pins) {
        externalResourcesData = externalResourcesData.map(
          (externalResource: ExternalResource) => ({
            ...externalResource,
            is_pinned: pins.some(
              (pin: Pin) =>
                pin?.id == externalResource?.id &&
                pin.source === "fr.openent.mediacentre.source.GAR",
            ),
          }),
        );
      }
      setExternalResources(externalResourcesData);
    }
  }, [data, pins]);

  return {
    externalResources,
    setExternalResources,
    refetchSearch,
    error,
    isLoading,
  };
};
