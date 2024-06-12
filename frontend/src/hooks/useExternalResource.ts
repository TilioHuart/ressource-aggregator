import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useSearchQuery } from "../services/api/search.service";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
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

  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  const { data, error, isLoading } = useSearchQuery(query);

  const [externalResources, setExternalResources] = useState<
    ExternalResource[]
  >([]);
  const { favorites } = useFavorite();

  const selectDisciplines = (externalResources: ExternalResource[]) => {
    const disciplines: string[] = [];

    externalResources.forEach((externalResource) => {
      if (externalResource.disciplines) {
        externalResource.disciplines.forEach((discipline) => {
          if (!disciplines.includes(discipline)) {
            disciplines.push(discipline);
          }
        });
      }
    });

    setDisciplines(disciplines);
  };

  const selectLevels = (externalResources: ExternalResource[]) => {
    const levels: string[] = [];

    externalResources.forEach((externalResource) => {
      if (externalResource.levels) {
        externalResource.levels.forEach((level) => {
          if (!levels.includes(level)) {
            levels.push(level);
          }
        });
      }
    });

    setLevels(levels);
  };

  const selectTypes = (externalResources: ExternalResource[]) => {
    const types: string[] = [];

    externalResources.forEach((externalResource) => {
      if (externalResource.document_types) {
        externalResource.document_types.forEach((type) => {
          if (!types.includes(type)) {
            types.push(type);
          }
        });
      }
    });

    setTypes(types);
  };

  useEffect(() => {
    if (favorites) {
      const searchResult: SearchResultCategory[] = data;
      const gar = searchResult?.find(
        (result) => result?.data?.source == "fr.openent.mediacentre.source.GAR",
      );
      let externalResourcesData: ExternalResource[] =
        gar?.data?.resources || [];
      externalResourcesData = externalResourcesData.map(
        (externalResource: ExternalResource) => ({
          ...externalResource,
          favorite: favorites.some(
            (fav: Favorite) => fav.id === externalResource.id,
          ),
        }),
      );
      selectDisciplines(externalResourcesData);
      selectLevels(externalResourcesData);
      selectTypes(externalResourcesData);
      setExternalResources(externalResourcesData);
    }
  }, [favorites, data]);

  return {
    externalResources,
    setExternalResources,
    disciplines,
    levels,
    types,
    error,
    isLoading,
  };
};
