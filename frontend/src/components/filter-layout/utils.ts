import { GAR, SIGNET } from "~/core/const/sources.const";
import { Resource } from "~/model/Resource.model";
import { ResourcesMap } from "~/model/ResourcesMap";
import { Signet } from "~/model/Signet.model";
import { sortByAlphabet } from "~/utils/sortResources.util";

const filterBySources = (
  resources: ResourcesMap,
  sources: string[],
  SOURCES: {
    MANUALS: string;
    RESOURCES: string;
    SIGNETS: string;
    MOODLES: string;
  },
) => {
  if (!sources.length) {
    return [
      ...sortByAlphabet(resources.textbooks),
      ...sortByAlphabet(resources.externalResources),
      ...sortByAlphabet(resources.signets),
      ...sortByAlphabet(resources.moodle),
    ];
  }
  let filteredResources: Resource[] = [];
  if (sources.some((source) => source === SOURCES.MANUALS)) {
    filteredResources = [
      ...filteredResources,
      ...sortByAlphabet(resources.textbooks),
    ];
  }
  if (sources.some((source) => source === SOURCES.RESOURCES)) {
    filteredResources = [
      ...filteredResources,
      ...sortByAlphabet(resources.externalResources),
    ];
  }
  if (sources.some((source) => source === SOURCES.SIGNETS)) {
    filteredResources = [
      ...filteredResources,
      ...sortByAlphabet(resources.signets),
    ];
  }
  if (sources.some((source) => source === SOURCES.MOODLES)) {
    filteredResources = [
      ...filteredResources,
      ...sortByAlphabet(resources.moodle),
    ];
  }
  return filteredResources;
};

const filterByThemes = (
  resources: Resource[],
  themes: string[],
  THEMES: {
    ORIENTATION: string;
    WITHOUT_THEME: string;
  },
) => {
  if (themes.length === 1) {
    // we filter only if one theme is selected
    return resources.filter((resource) => {
      if (resource.source === SIGNET) {
        const signet = resource as Signet;
        if (themes[0] === THEMES.ORIENTATION)
          return (
            signet.document_types?.includes("Orientation") || signet.orientation
          );
        if (themes[0] === THEMES.WITHOUT_THEME)
          return (
            !signet.document_types?.includes("Orientation") &&
            !signet.orientation
          );
      }
      return true;
    });
  }
  return resources;
};

const filterByTypes = (resources: Resource[], types: string[]) => {
  if (!types.length) {
    return resources;
  }
  return resources.filter((resource) => {
    if (resource.source !== GAR || resource.is_textbook) {
      return false;
    } // we filter only external resources
    return types.some((type) => resource.document_types?.includes(type));
  });
};

const filterByLevels = (resources: Resource[], levels: string[]) => {
  if (!levels.length) {
    return resources;
  }
  return resources.filter((resource) =>
    levels.some((level) => resource.levels?.includes(level)),
  );
};

const filterByDisciplines = (resources: Resource[], disciplines: string[]) => {
  if (!disciplines.length) {
    return resources;
  }
  return resources.filter((resource) =>
    disciplines.some(
      (discipline) => resource.disciplines?.includes(discipline),
    ),
  );
};

export const filterByAllDropdowns = (
  resources: ResourcesMap,
  selectedCheckboxes: any,
  SOURCES: any,
  THEMES: any,
) => {
  let filteredResources: Resource[] = [];
  filteredResources = filterBySources(
    resources,
    selectedCheckboxes.sources,
    SOURCES,
  );
  filteredResources = filterByThemes(
    filteredResources,
    selectedCheckboxes.themes,
    THEMES,
  );
  filteredResources = filterByTypes(
    filteredResources,
    selectedCheckboxes.types,
  );
  filteredResources = filterByLevels(
    filteredResources,
    selectedCheckboxes.levels,
  );
  filteredResources = filterByDisciplines(
    filteredResources,
    selectedCheckboxes.disciplines,
  );
  return filteredResources;
};
