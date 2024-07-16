import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useSearchQuery } from "../services/api/search.service";
import { Pin } from "~/model/Pin.model";
import { Resource } from "~/model/Resource.model";
import { SearchResultCategory } from "~/model/SearchResultCategory";
import { usePinProvider } from "~/providers/PinProvider";

export const useSearch = (query: any) => {
  const { pins } = usePinProvider();
  const [allResources, setAllResources] = useState<Resource[] | null>(null);
  const { favorites } = useFavorite();
  const {
    data,
    error,
    isLoading,
    refetch: refetchSearch,
  } = useSearchQuery(query);

  useEffect(() => {
    if (!isLoading) {
      const searchResult: SearchResultCategory[] = data;

      const signets = searchResult?.find(
        (result) =>
          result?.data?.source == "fr.openent.mediacentre.source.Signet",
      );
      const moodle = searchResult?.find(
        (result) =>
          result?.data?.source == "fr.openent.mediacentre.source.Moodle",
      );
      const gar = searchResult?.find(
        (result) => result?.data?.source == "fr.openent.mediacentre.source.GAR",
      );
      let signetResources = signets?.data?.resources || [];
      let moodleResources = moodle?.data?.resources || [];
      let garResources = gar?.data?.resources || [];

      // map with pins
      if (pins) {
        signetResources = signetResources.map((signetResource: Resource) => ({
          ...signetResource,
          is_pinned: pins.some(
            (pin: Pin) =>
              pin?.id == signetResource?.id &&
              pin.source === "fr.openent.mediacentre.source.Signet",
          ),
        }));
        moodleResources = moodleResources.map((moodleResource: Resource) => ({
          ...moodleResource,
          is_pinned: pins.some(
            (pin: Pin) =>
              pin?.id == moodleResource?.id &&
              pin.source === "fr.openent.mediacentre.source.Moodle",
          ),
        }));
        garResources = garResources.map((garResource: Resource) => ({
          ...garResource,
          is_pinned: pins.some(
            (pin: Pin) =>
              pin?.id == garResource?.id &&
              pin.source === "fr.openent.mediacentre.source.GAR",
          ),
        }));
      }

      setAllResources([
        ...signetResources,
        ...moodleResources,
        ...garResources,
      ]);
    }
  }, [data, isLoading, favorites, pins]);

  return {
    allResources,
    error,
    isLoading,
    refetchSearch,
  };
};
