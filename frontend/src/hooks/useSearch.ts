import { useEffect, useState } from "react";

import { useFavorite } from "./useFavorite";
import { useSearchQuery } from "../services/api/search.service";
import { Favorite } from "~/model/Favorite.model";
import { Moodle } from "~/model/Moodle.model";
import { Resource } from "~/model/Resource.model";
import { SearchResultCategory } from "~/model/SearchResultCategory";
import { SearchResultData } from "~/model/SearchResultData.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

export const useSearch = (query: any) => {
  const [allResources, setAllResources] = useState<SearchResultData>({
    signets: [],
    textbooks: [],
    externals_resources: [],
    moodle: [],
  });
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const { favorites } = useFavorite();
  const { data, error, isLoading } = useSearchQuery(query);

  const selectDisciplines = (
    signets: Signet[],
    moodle: Moodle[],
    gar: Textbook[],
  ) => {
    const disciplines: string[] = [];

    const addDisciplines = (items: { disciplines?: string[] }[]) => {
      items.forEach((item) => {
        item.disciplines?.forEach((discipline) => {
          if (!disciplines.includes(discipline)) {
            disciplines.push(discipline);
          }
        });
      });
    };

    addDisciplines(signets);
    addDisciplines(moodle);
    addDisciplines(gar);
    setDisciplines(disciplines);
  };

  const selectLevels = (
    signets: Signet[],
    moodle: Moodle[],
    gar: Textbook[],
  ) => {
    const levels: string[] = [];

    const addLevels = (items: { levels?: string[] }[]) => {
      items.forEach((item) => {
        item.levels?.forEach((level) => {
          if (!levels.includes(level)) {
            levels.push(level);
          }
        });
      });
    };

    addLevels(signets);
    addLevels(moodle);
    addLevels(gar);
    setLevels(levels);
  };

  const selectTypes = (
    signets: Signet[],
    moodle: Moodle[],
    gar: Textbook[],
  ) => {
    const types: string[] = [];

    const addTypes = (items: { document_types?: string[] }[]) => {
      items.forEach((item) => {
        item.document_types?.forEach((type) => {
          if (!types.includes(type)) {
            types.push(type);
          }
        });
      });
    };

    addTypes(signets);
    addTypes(moodle);
    addTypes(gar);
    setTypes(types);
  };

  useEffect(() => {
    if (!isLoading) {
      const searchResult: SearchResultCategory[] = data;
      let searchResultData: SearchResultData = {
        signets: [],
        textbooks: [],
        externals_resources: [],
        moodle: [],
      };
      const signets = searchResult.find(
        (result) =>
          result?.data?.source == "fr.openent.mediacentre.source.Signet",
      );
      const moodle = searchResult.find(
        (result) =>
          result?.data?.source == "fr.openent.mediacentre.source.Moodle",
      );
      const gar = searchResult.find(
        (result) => result?.data?.source == "fr.openent.mediacentre.source.GAR",
      );
      searchResultData.signets = signets?.data?.resources ?? [];
      searchResultData.moodle = moodle?.data?.resources ?? [];
      selectDisciplines(
        searchResultData.signets,
        searchResultData.moodle,
        gar?.data?.resources ?? [],
      );
      selectLevels(
        searchResultData.signets,
        searchResultData.moodle,
        gar?.data?.resources ?? [],
      );
      selectTypes(
        searchResultData.signets,
        searchResultData.moodle,
        gar?.data?.resources ?? [],
      );
      if (gar) {
        searchResultData.externals_resources =
          gar?.data?.resources.filter(
            (resource: Resource) =>
              !resource?.document_types?.includes("livre numérique"),
          ) ?? [];
        searchResultData.textbooks =
          gar?.data?.resources.filter(
            (resource: Resource) =>
              resource?.document_types?.includes("livre numérique"),
          ) ?? [];
      }
      if (favorites) {
        const updateFavoritesInCategory = (
          categoryData: any[],
          favorites: Favorite[],
        ) => {
          return categoryData.map((item) => ({
            ...item,
            favorite: favorites.some((fav) => fav.id === item.id),
          }));
        };

        const updatedSearchResultData: SearchResultData = {
          signets: updateFavoritesInCategory(
            searchResultData.signets,
            favorites,
          ),
          textbooks: updateFavoritesInCategory(
            searchResultData.textbooks,
            favorites,
          ),
          externals_resources: updateFavoritesInCategory(
            searchResultData.externals_resources,
            favorites,
          ),
          moodle: updateFavoritesInCategory(searchResultData.moodle, favorites),
        };
        searchResultData = updatedSearchResultData;
      }
      setAllResources(searchResultData);
    }
  }, [data, isLoading, favorites]);

  return { allResources, disciplines, levels, types, error, isLoading };
};
