import { useEffect, useState } from "react";

import { GAR, MOODLE, SIGNET } from "~/core/const/sources.const";
import { Resource } from "~/model/Resource.model";
import { ResourceInfosMap } from "~/model/ResourceInfosMap";
import { ResourcesMap } from "~/model/ResourcesMap";

const ResourcesMapInitialStates: ResourcesMap = {
  textbooks: [],
  externalResources: [],
  moodle: [],
  signets: [],
};
const ResourceInfosMapInitialStates: ResourceInfosMap = {
  disciplines: [],
  levels: [],
  types: [],
};

// Normalize string to avoid accent and case issues
const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// custom sort function for strings that normalizes the strings before comparing them
const customStringSort = (a: string, b: string) =>
  normalizeString(a).localeCompare(normalizeString(b));

const isTextbook = (resource: Resource) =>
  resource.source === GAR && (resource?.is_textbook ?? false);
const isExternalResource = (resource: Resource) =>
  resource.source === GAR && (!resource?.is_textbook ?? true);
const isMoodle = (resource: Resource) => resource.source === MOODLE;
const isSignet = (resource: Resource) => resource.source === SIGNET;

// this kook get all information about a list of resources and it's used in the FilterLayout component
export const useResourceListInfo = (resources: Resource[] | null) => {
  const [resourcesMap, setResourcesMap] = useState(ResourcesMapInitialStates);

  const [resourcesInfosMap, setResourcesInfosMap] = useState(
    ResourceInfosMapInitialStates,
  );

  useEffect(() => {
    if (!resources) return;

    const result = resources.reduce(
      (acc, resource) => {
        // Case textbook
        if (isTextbook(resource)) {
          acc.textbooks = [...acc.textbooks, resource];
        }
        // Case external resource
        if (isExternalResource(resource)) {
          acc.externalResources = [...acc.externalResources, resource];
          acc.types = [
            ...acc.types,
            ...resource.document_types.filter(
              (type) => !acc.types.includes(type),
            ),
          ];
        }
        // Case moodle
        if (isMoodle(resource)) {
          acc.moodle = [...acc.moodle, resource];
        }
        // Case signet
        if (isSignet(resource)) {
          acc.signets = [...acc.signets, resource];
        }

        acc.disciplines = [
          ...acc.disciplines,
          ...resource.disciplines.filter(
            (discipline) => !acc.disciplines.includes(discipline),
          ),
        ];
        acc.levels = [
          ...acc.levels,
          ...resource.levels.filter((level) => !acc.levels.includes(level)),
        ];

        return acc;
      },
      {
        textbooks: [] as Resource[],
        externalResources: [] as Resource[],
        moodle: [] as Resource[],
        signets: [] as Resource[],
        disciplines: [] as string[],
        levels: [] as string[],
        types: [] as string[],
      },
    );

    setResourcesMap({
      textbooks: result.textbooks,
      externalResources: result.externalResources,
      moodle: result.moodle,
      signets: result.signets,
    });

    setResourcesInfosMap({
      // sort disciplines, levels and types by custom string sort
      disciplines: result.disciplines.sort(customStringSort),
      levels: result.levels.sort(customStringSort),
      types: result.types.sort(customStringSort),
    });
  }, [resources]);

  return {
    resourcesMap,
    resourcesInfosMap,
  };
};
