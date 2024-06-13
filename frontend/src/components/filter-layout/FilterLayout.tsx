import React, { useCallback, useEffect, useState } from "react";

import { Checkbox, Dropdown } from "@edifice-ui/react";
import "./FilterLayout.scss";
import { useTranslation } from "react-i18next";

import { SearchResultData } from "~/model/SearchResultData.model";

interface FilterLayoutProps {
  resources: SearchResultData;
  disciplines: string[];
  levels: string[];
  types: string[];
  setAllResourcesDisplayed: React.Dispatch<
    React.SetStateAction<SearchResultData>
  >;
  type?: string;
}

export const FilterLayout: React.FC<FilterLayoutProps> = ({
  resources,
  disciplines,
  levels,
  types,
  setAllResourcesDisplayed,
  type,
}) => {
  const { t } = useTranslation();
  const [checkboxResource, setCheckboxResource] = useState<boolean>(
    resources?.externals_resources?.length > 0 ?? false,
  );
  const [checkboxSignet, setCheckboxSignet] = useState<boolean>(
    resources?.signets?.length > 0 ?? false,
  );
  const [checkboxMoodle, setCheckboxMoodle] = useState<boolean>(
    resources?.moodle?.length > 0 ?? false,
  );
  const [selectedCheckboxesLevels, setSelectedCheckboxesLevels] =
    useState<string[]>(levels);
  const [selectedCheckboxesTypes, setSelectedCheckboxesTypes] =
    useState<string[]>(types);
  const [selectedCheckboxesDiscipline, setSelectedCheckboxesDiscipline] =
    useState<string[]>(disciplines);

  const handleMultiCheckbox = (
    selectedCheckboxes: string[],
    setSelectedCheckboxes: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    let checked = [...selectedCheckboxes];
    const findIndex = checked.findIndex(
      (item: string): boolean => item === value,
    );

    if (!selectedCheckboxes.includes(value)) {
      checked = [...selectedCheckboxes, value];
    } else {
      checked = selectedCheckboxes.filter(
        (_, index: number) => index !== findIndex,
      );
    }
    setSelectedCheckboxes(checked);
  };

  const isGarSelected = useCallback(() => {
    return checkboxResource;
  }, [checkboxResource]);

  const fetchFilters = useCallback(() => {
    const filteredResources: SearchResultData = {
      signets: [],
      externals_resources: [],
      moodle: [],
    };
    if (type !== "textbook" && type !== "externals_resources") {
      if (checkboxResource) {
        filteredResources.externals_resources = resources.externals_resources;
      }
      if (checkboxSignet) {
        filteredResources.signets = resources.signets;
      }
      if (checkboxMoodle) {
        filteredResources.moodle = resources.moodle;
      }
    } else {
      if (type === "externals_resources") {
        filteredResources.externals_resources = resources.externals_resources;
      }
    }
    const filterByCriteria = (
      resourceArray: any[],
      disciplines: string[],
      levels: string[],
      types: string[],
    ) => {
      return resourceArray.filter((resource) => {
        const matchesDiscipline =
          resource?.disciplines &&
          disciplines.some((discipline) =>
            resource.disciplines.includes(discipline),
          );
        const matchesLevel =
          resource?.levels &&
          levels.some((level) => resource.levels.includes(level));
        const matchesType =
          resource?.document_types &&
          types.some((type) => resource.document_types.includes(type));
        return matchesDiscipline || matchesLevel || matchesType;
      });
    };
    if (isGarSelected()) {
      filteredResources.externals_resources = filterByCriteria(
        filteredResources.externals_resources,
        selectedCheckboxesDiscipline,
        selectedCheckboxesLevels,
        selectedCheckboxesTypes,
      );
      filteredResources.signets = filterByCriteria(
        filteredResources.signets,
        selectedCheckboxesDiscipline,
        selectedCheckboxesLevels,
        selectedCheckboxesTypes,
      );
      filteredResources.moodle = filterByCriteria(
        filteredResources.moodle,
        selectedCheckboxesDiscipline,
        selectedCheckboxesLevels,
        selectedCheckboxesTypes,
      );
    }
    setAllResourcesDisplayed(filteredResources);
  }, [
    checkboxSignet,
    checkboxMoodle,
    checkboxResource,
    selectedCheckboxesDiscipline,
    selectedCheckboxesLevels,
    selectedCheckboxesTypes,
    isGarSelected,
    resources,
    setAllResourcesDisplayed,
    type,
  ]);

  const checkboxOptionsDiscipline = disciplines ?? [];
  const checkboxOptionsLevels = levels ?? [];
  const checkboxOptionsType = types ?? [];

  const countLevels = selectedCheckboxesLevels.length;
  const countDisciplines = selectedCheckboxesDiscipline.length;
  const countType = selectedCheckboxesTypes.length;

  useEffect(() => {
    if (resources?.externals_resources?.length > 0) {
      setCheckboxResource(true);
    }
    if (resources?.signets?.length > 0) {
      setCheckboxSignet(true);
    }
    if (resources?.moodle?.length > 0) {
      setCheckboxMoodle(true);
    }
    setSelectedCheckboxesDiscipline(disciplines);
    setSelectedCheckboxesLevels(levels);
    setSelectedCheckboxesTypes(types);
  }, [resources, disciplines, levels, types]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return (
    <>
      <div className="med-filters">
        {type !== "textbook" && type !== "externals_resources" && (
          <>
            <Checkbox
              checked={checkboxResource}
              label="Ressources"
              onChange={() => setCheckboxResource((isChecked) => !isChecked)}
            />
          </>
        )}
        {(isGarSelected() ||
          type === "textbook" ||
          type === "externals_resources") && (
          <>
            <Dropdown>
              <Dropdown.Trigger label="Type" badgeContent={countType || 0} />
              <Dropdown.Menu>
                <Dropdown.Item
                  key={"all-selected-type"}
                  onClick={() =>
                    selectedCheckboxesTypes.length ===
                    checkboxOptionsType.length
                      ? setSelectedCheckboxesTypes([])
                      : setSelectedCheckboxesTypes(checkboxOptionsType)
                  }
                >
                  {selectedCheckboxesTypes.length === checkboxOptionsType.length
                    ? t("mediacentre.combo.deselectAll")
                    : t("mediacentre.combo.selectAll")}
                </Dropdown.Item>
                <Dropdown.Separator />
                {checkboxOptionsType.map((option, index) => (
                  <Dropdown.CheckboxItem
                    key={index}
                    value={option}
                    model={selectedCheckboxesTypes}
                    onChange={() =>
                      handleMultiCheckbox(
                        selectedCheckboxesTypes,
                        setSelectedCheckboxesTypes,
                        option,
                      )
                    }
                  >
                    {option}
                  </Dropdown.CheckboxItem>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Trigger
                label="Niveaux"
                badgeContent={countLevels || 0}
              />
              <Dropdown.Menu>
                <Dropdown.Item
                  key={"all-selected-levels"}
                  onClick={() =>
                    selectedCheckboxesLevels.length ===
                    checkboxOptionsLevels.length
                      ? setSelectedCheckboxesLevels([])
                      : setSelectedCheckboxesLevels(checkboxOptionsLevels)
                  }
                >
                  {selectedCheckboxesLevels.length ===
                  checkboxOptionsLevels.length
                    ? t("mediacentre.combo.deselectAll")
                    : t("mediacentre.combo.selectAll")}
                </Dropdown.Item>
                <Dropdown.Separator />
                {checkboxOptionsLevels.map((option, index) => (
                  <Dropdown.CheckboxItem
                    key={index}
                    value={option}
                    model={selectedCheckboxesLevels}
                    onChange={() =>
                      handleMultiCheckbox(
                        selectedCheckboxesLevels,
                        setSelectedCheckboxesLevels,
                        option,
                      )
                    }
                  >
                    {option}
                  </Dropdown.CheckboxItem>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Trigger
                label="Disciplines"
                badgeContent={countDisciplines || 0}
              />
              <Dropdown.Menu>
                <Dropdown.Item
                  key={"all-selected-disciplines"}
                  onClick={() =>
                    selectedCheckboxesDiscipline.length ===
                    checkboxOptionsDiscipline.length
                      ? setSelectedCheckboxesDiscipline([])
                      : setSelectedCheckboxesDiscipline(
                          checkboxOptionsDiscipline,
                        )
                  }
                >
                  {selectedCheckboxesDiscipline.length ===
                  checkboxOptionsDiscipline.length
                    ? t("mediacentre.combo.deselectAll")
                    : t("mediacentre.combo.selectAll")}
                </Dropdown.Item>
                <Dropdown.Separator />
                {checkboxOptionsDiscipline.map((option, index) => (
                  <Dropdown.CheckboxItem
                    key={index}
                    value={option}
                    model={selectedCheckboxesDiscipline}
                    onChange={() =>
                      handleMultiCheckbox(
                        selectedCheckboxesDiscipline,
                        setSelectedCheckboxesDiscipline,
                        option,
                      )
                    }
                  >
                    {option}
                  </Dropdown.CheckboxItem>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}
        {type !== "textbook" && type !== "externals_resources" && (
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
