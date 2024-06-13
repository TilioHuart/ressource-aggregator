import { useEffect, useState } from "react";

import { GlobalResource } from "./../model/GlobalResource.model";
import { useGetGlobalQuery } from "./../services/api/global.service";
import { useFavorite } from "./useFavorite";
import { Favorite } from "~/model/Favorite.model";

export const useGlobal = () => {
  const { data: global, error, isLoading } = useGetGlobalQuery(null);
  const [globals, setGlobals] = useState<GlobalResource[]>([]);
  const { favorites } = useFavorite();
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  const selectDisciplines = (globalResources: GlobalResource[]) => {
    const disciplines: string[] = [];

    globalResources.forEach((globalResource: GlobalResource) => {
      if (globalResource?.disciplines) {
        globalResource?.disciplines.forEach((discipline: string) => {
          if (!disciplines.includes(discipline)) {
            disciplines.push(discipline);
          }
        });
      }
    });

    setDisciplines(disciplines);
  };

  const selectLevels = (globalResources: GlobalResource[]) => {
    const levels: string[] = [];

    globalResources?.forEach((globalResource: GlobalResource) => {
      if (globalResource?.levels) {
        globalResource?.levels.forEach((level: string) => {
          if (!levels.includes(level)) {
            levels.push(level);
          }
        });
      }
    });

    setLevels(levels);
  };

  const selectTypes = (globalResources: GlobalResource[]) => {
    const types: string[] = [];

    globalResources?.forEach((globalResource: GlobalResource) => {
      if (globalResource.document_types) {
        globalResource.document_types.forEach((type: string) => {
          if (!types.includes(type)) {
            types.push(type);
          }
        });
      }
    });

    setTypes(types);
  };

  useEffect(() => {
    if (favorites && global) {
      let globalData: GlobalResource[] = global?.data?.global ?? [];
      globalData = globalData.map((global: GlobalResource) => ({
        ...global,
        favorite: favorites.some((fav: Favorite) => fav._id === global._id),
      }));
      selectDisciplines(globalData);
      selectLevels(globalData);
      selectTypes(globalData);
      setGlobals(globalData);
    }
  }, [global, favorites]);

  return { globals, setGlobals, disciplines, levels, types, error, isLoading };
};
