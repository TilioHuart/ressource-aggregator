import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { filterByAllDropdowns } from "./utils";
import { DropDown } from "../drop-down/DropDown";
import { useResourceListInfo } from "~/hooks/useResourceListInfo";
import { Resource } from "~/model/Resource.model";
import "./FilterLayout.scss";

interface FilterLayoutProps {
  resources: Resource[] | null;
  allResourcesDisplayed: Resource[] | null;
  setAllResourcesDisplayed: React.Dispatch<
    React.SetStateAction<Resource[] | null>
  >;
}

export const FilterLayout: React.FC<FilterLayoutProps> = ({
  resources,
  allResourcesDisplayed,
  setAllResourcesDisplayed,
}) => {
  const { resourcesMap, resourcesInfosMap } = useResourceListInfo(resources);
  const { resourcesInfosMap: displayedResourcesInfosMap } = useResourceListInfo(
    allResourcesDisplayed,
  );

  const page = useLocation().pathname;
  const { t } = useTranslation();

  const [sources, setSources] = useState<string[]>([]);
  const themes = [
    t("mediacentre.signets.themes.orientation"),
    t("mediacentre.signets.without.theme"),
  ];

  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    sources: [] as string[],
    themes: [] as string[],
    levels: [] as string[],
    types: [] as string[],
    disciplines: [] as string[],
  });

  const setSelectedCheckboxesItems = (key: string) => {
    return (value: string[]) =>
      setSelectedCheckboxes({ ...selectedCheckboxes, [key]: value });
  };

  const SOURCES = {
    MANUALS: t("mediacentre.sidebar.textbooks"),
    RESOURCES: t("mediacentre.sidebar.resources"),
    SIGNETS: t("mediacentre.sidebar.signets"),
    MOODLES: t("mediacentre.search.card.moodle"),
  };

  const THEMES = {
    ORIENTATION: t("mediacentre.signets.themes.orientation"),
    WITHOUT_THEME: t("mediacentre.signets.without.theme"),
  };

  // we show themes only on signets page
  const isShowingThemes = page === "/signets";

  // we show types only if we have resources in displayed resources
  const isShowingTypes = !!displayedResourcesInfosMap.types.length;

  // we show sources only if we are on favorites or search page
  const isShowingSources = page === "/favorites" || page === "/search";

  useEffect(() => {
    if (!resources) {
      return;
    }
    setAllResourcesDisplayed(
      filterByAllDropdowns(resourcesMap, selectedCheckboxes, SOURCES, THEMES),
    );
  }, [selectedCheckboxes, resourcesMap, resources, setAllResourcesDisplayed]);

  useEffect(() => {
    let sourcesTemp: string[] = [];
    if (resourcesMap.textbooks.length) {
      sourcesTemp = [...sourcesTemp, SOURCES.MANUALS];
    }
    if (resourcesMap.externalResources.length) {
      sourcesTemp = [...sourcesTemp, SOURCES.RESOURCES];
    }
    if (resourcesMap.signets.length) {
      sourcesTemp = [...sourcesTemp, SOURCES.SIGNETS];
    }
    if (resourcesMap.moodle.length) {
      sourcesTemp = [...sourcesTemp, SOURCES.MOODLES];
    }
    setSources(sourcesTemp);
    // reset selected checkboxes when we change the resources
    setSelectedCheckboxes({
      sources: [],
      themes: [],
      levels: [],
      types: [],
      disciplines: [],
    });
  }, [resourcesMap]);

  return (
    <>
      <div className="med-filters">
        {isShowingSources && (
          <DropDown
            selectedCheckboxes={selectedCheckboxes.sources}
            setSelectedCheckboxes={setSelectedCheckboxesItems("sources")}
            checkboxOptions={sources ?? []}
            label={t(
              `mediacentre.filter.${sources.length > 1 ? "sources" : "source"}`,
            )}
          />
        )}
        {isShowingTypes && (
          <DropDown
            selectedCheckboxes={selectedCheckboxes.types}
            setSelectedCheckboxes={setSelectedCheckboxesItems("types")}
            checkboxOptions={resourcesInfosMap.types ?? []}
            label={t(
              `mediacentre.filter.${
                resourcesInfosMap.types.length > 1 ? "types" : "type"
              }`,
            )}
          />
        )}
        {isShowingThemes && (
          <DropDown
            selectedCheckboxes={selectedCheckboxes.themes}
            setSelectedCheckboxes={setSelectedCheckboxesItems("themes")}
            checkboxOptions={themes ?? []}
            label={t("mediacentre.filter.themes")}
          />
        )}
        <DropDown
          selectedCheckboxes={selectedCheckboxes.levels}
          setSelectedCheckboxes={setSelectedCheckboxesItems("levels")}
          checkboxOptions={resourcesInfosMap.levels ?? []}
          label={t(
            `mediacentre.filter.${
              resourcesInfosMap.levels.length > 1 ? "levels" : "level"
            }`,
          )}
        />
        <DropDown
          selectedCheckboxes={selectedCheckboxes.disciplines}
          setSelectedCheckboxes={setSelectedCheckboxesItems("disciplines")}
          checkboxOptions={resourcesInfosMap.disciplines ?? []}
          label={t(
            `mediacentre.filter.${
              resourcesInfosMap.disciplines.length > 1
                ? "disciplines"
                : "discipline"
            }`,
          )}
        />
      </div>
    </>
  );
};
