import React, { useEffect, useState } from "react";

import { Checkbox } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { DropDown } from "../drop-down/DropDown";
import { useResourceListInfo } from "~/hooks/useResourceListInfo";
import { Resource } from "~/model/Resource.model";
import "./FilterLayout.scss";
import { sortByAlphabet } from "~/utils/sortResources.util";

interface FilterLayoutProps {
  resources: Resource[] | null;
  setAllResourcesDisplayed: React.Dispatch<
    React.SetStateAction<Resource[] | null>
  >;
}

export const FilterLayout: React.FC<FilterLayoutProps> = ({
  resources,
  setAllResourcesDisplayed,
}) => {
  const {
    textbooks,
    externalResources,
    signets,
    moodle,
    disciplines,
    levels,
    types,
    containTextbook,
    containExternalResource,
    containSignet,
    containMoodle,
  } = useResourceListInfo(resources);

  const page = useLocation().pathname;
  const { t } = useTranslation();
  // these useStates are used to store the state of the checkboxes
  const [checkboxTextbook, setCheckboxTextbook] =
    useState<boolean>(containTextbook);
  const [checkboxExternalResource, setCheckboxExternalResource] =
    useState<boolean>(containExternalResource);
  const [checkboxSignet, setCheckboxSignet] = useState<boolean>(containSignet);
  const [checkboxMoodle, setCheckboxMoodle] = useState<boolean>(containMoodle);
  // themes is used for the signets page
  const themes = [
    t("mediacentre.signets.themes.orientation"),
    t("mediacentre.signets.without.theme"),
  ];
  const [selectedCheckboxesThemes, setSelectedCheckboxesThemes] =
    useState<string[]>(themes);

  const [selectedCheckboxesLevels, setSelectedCheckboxesLevels] =
    useState<string[]>(levels);
  const [selectedCheckboxesTypes, setSelectedCheckboxesTypes] =
    useState<string[]>(types);
  const [selectedCheckboxesDiscipline, setSelectedCheckboxesDiscipline] =
    useState<string[]>(disciplines);

  useEffect(() => {
    if (!resources) {
      return;
    }

    let filteredResources: Resource[] = [];
    // first part we filter by single check (textbook, external resource, signet, moodle)
    if (checkboxTextbook) {
      filteredResources = [...filteredResources, ...sortByAlphabet(textbooks)];
    }
    if (checkboxExternalResource) {
      filteredResources = [
        ...filteredResources,
        ...sortByAlphabet(externalResources),
      ];
    }
    if (checkboxSignet) {
      filteredResources = [...filteredResources, ...sortByAlphabet(signets)];
    }
    if (checkboxMoodle) {
      filteredResources = [...filteredResources, ...sortByAlphabet(moodle)];
    }
    // second part we filter by multiple check (discipline, level, type)
    filteredResources = filteredResources.filter((resource) => {
      const matchesDiscipline =
        resource?.disciplines &&
        selectedCheckboxesDiscipline.length > 0 &&
        selectedCheckboxesDiscipline.some((discipline) =>
          resource.disciplines.includes(discipline),
        );
      const matchesLevel =
        resource?.levels &&
        selectedCheckboxesLevels.length > 0 &&
        selectedCheckboxesLevels.some((level) =>
          resource.levels.includes(level),
        );
      const matchesType =
        resource?.document_types &&
        selectedCheckboxesTypes.length > 0 &&
        selectedCheckboxesTypes.some((type) =>
          resource.document_types.includes(type),
        );
      const matchesTheme =
        resource?.document_types &&
        selectedCheckboxesThemes.length > 0 &&
        selectedCheckboxesThemes.some((type) => {
          const containOrientation = selectedCheckboxesThemes.includes(
            t("mediacentre.signets.themes.orientation"),
          );
          return (
            (type === t("mediacentre.signets.themes.orientation") &&
              containOrientation) ||
            (type === t("mediacentre.signets.without.theme") &&
              !containOrientation)
          );
        });
      return matchesDiscipline || matchesLevel || matchesType || matchesTheme;
    });
    setAllResourcesDisplayed(filteredResources);
  }, [
    checkboxSignet,
    checkboxMoodle,
    checkboxExternalResource,
    checkboxTextbook,
    selectedCheckboxesDiscipline,
    selectedCheckboxesLevels,
    selectedCheckboxesTypes,
    textbooks,
    externalResources,
    signets,
    moodle,
    resources,
    setAllResourcesDisplayed,
  ]);

  useEffect(() => {
    if (containTextbook) {
      setCheckboxTextbook(true);
    }
    if (containExternalResource) {
      setCheckboxExternalResource(true);
    }
    if (containSignet) {
      setCheckboxSignet(true);
    }
    if (containMoodle) {
      setCheckboxMoodle(true);
    }
    setSelectedCheckboxesDiscipline(disciplines);
    setSelectedCheckboxesLevels(levels);
    setSelectedCheckboxesTypes(types);
  }, [
    containTextbook,
    containExternalResource,
    containSignet,
    containMoodle,
    disciplines,
    levels,
    types,
  ]);

  return (
    <>
      <div className="med-filters">
        {(page === "/search" || page === "/favorites") && (
          <>
            <Checkbox
              checked={checkboxTextbook}
              label="Manuels"
              onChange={() => setCheckboxTextbook((isChecked) => !isChecked)}
            />
            <Checkbox
              checked={checkboxExternalResource}
              label="Ressources"
              onChange={() =>
                setCheckboxExternalResource((isChecked) => !isChecked)
              }
            />
          </>
        )}
        {(checkboxExternalResource || page === "/resources") && (
          <DropDown
            selectedCheckboxes={selectedCheckboxesTypes}
            setSelectedCheckboxes={setSelectedCheckboxesTypes}
            checkboxOptions={types ?? []}
            label="Type"
          />
        )}
        {page === "/signets" && (
          <DropDown
            selectedCheckboxes={selectedCheckboxesThemes}
            setSelectedCheckboxes={setSelectedCheckboxesThemes}
            checkboxOptions={themes ?? []}
            label="Thématiques"
          />
        )}
        <DropDown
          selectedCheckboxes={selectedCheckboxesLevels}
          setSelectedCheckboxes={setSelectedCheckboxesLevels}
          checkboxOptions={levels ?? []}
          label="Niveaux"
        />
        <DropDown
          selectedCheckboxes={selectedCheckboxesDiscipline}
          setSelectedCheckboxes={setSelectedCheckboxesDiscipline}
          checkboxOptions={disciplines ?? []}
          label="Disciplines"
        />
        {(page === "/search" || page === "/favorites") && (
          <>
            <Checkbox
              checked={checkboxSignet}
              label="Signets"
              onChange={() => setCheckboxSignet((isChecked) => !isChecked)}
            />
            <Checkbox
              checked={checkboxMoodle}
              label="Moodle"
              onChange={() => setCheckboxMoodle((isChecked) => !isChecked)}
            />
          </>
        )}
      </div>
    </>
  );
};
