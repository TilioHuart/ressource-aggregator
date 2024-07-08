import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useSearchQuery } from "../services/api/search.service";
import { Resource } from "~/model/Resource.model";
import { SearchResultCategory } from "~/model/SearchResultCategory";

export const useSearch = (query: any) => {
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
      const signetResources = signets?.data?.resources || [];
      const moodleResources = moodle?.data?.resources || [];
      const garResources = gar?.data?.resources || [];

      setAllResources([
        ...signetResources,
        ...moodleResources,
        ...garResources,
      ]);
    }
  }, [data, isLoading, favorites]);

  return {
    allResources,
    error,
    isLoading,
    refetchSearch,
  };
};
