import React, { useCallback, useEffect, useState } from "react";

import { Dropdown } from "@edifice-ui/react";
import "../filter-layout/FilterLayout.scss";
import { useTranslation } from "react-i18next";

import { ExternalResource } from "~/model/ExternalResource.model";
import { SearchResultData } from "~/model/SearchResultData.model";

interface FilterResourceLayoutProps {
  resources: ExternalResource[];
  disciplines: string[];
  levels: string[];
  types: string[];
  setAllResourcesDisplayed: React.Dispatch<
    React.SetStateAction<SearchResultData>
  >;
}

export const FilterResourceLayout: React.FC<FilterResourceLayoutProps> = ({
  resources,
  disciplines,
  levels,
  types,
  setAllResourcesDisplayed,
}) => {
  const { t } = useTranslation();
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

  const fetchFilters = useCallback(() => {
    const filteredResources: SearchResultData = {
      signets: [],
      externals_resources: resources,
      moodle: [],
    };
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
    filteredResources.externals_resources = filterByCriteria(
      filteredResources.externals_resources,
      selectedCheckboxesDiscipline,
      selectedCheckboxesLevels,
      selectedCheckboxesTypes,
    );
    setAllResourcesDisplayed(filteredResources);
  }, [
    selectedCheckboxesDiscipline,
    selectedCheckboxesLevels,
    selectedCheckboxesTypes,
    setAllResourcesDisplayed,
    resources,
  ]);

  const checkboxOptionsDiscipline = disciplines ?? [];
  const checkboxOptionsLevels = levels ?? [];
  const checkboxOptionsType = types ?? [];

  const countLevels = selectedCheckboxesLevels.length;
  const countDisciplines = selectedCheckboxesDiscipline.length;
  const countType = selectedCheckboxesTypes.length;

  useEffect(() => {
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
        <Dropdown>
          <Dropdown.Trigger label="Type" badgeContent={countType || 0} />
          <Dropdown.Menu>
            <Dropdown.Item
              key={"all-selected-type"}
              onClick={() =>
                selectedCheckboxesTypes.length === checkboxOptionsType.length
                  ? setSelectedCheckboxesTypes([])
                  : setSelectedCheckboxesTypes(checkboxOptionsType)
              }
            >
              {selectedCheckboxesTypes.length === checkboxOptionsType.length
                ? t("mediacentre.combo.selectAll")
                : t("mediacentre.combo.deselectAll")}
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
          <Dropdown.Trigger label="Niveaux" badgeContent={countLevels || 0} />
          <Dropdown.Menu>
            <Dropdown.Item
              key={"all-selected-levels"}
              onClick={() =>
                selectedCheckboxesLevels.length === checkboxOptionsLevels.length
                  ? setSelectedCheckboxesLevels([])
                  : setSelectedCheckboxesLevels(checkboxOptionsLevels)
              }
            >
              {selectedCheckboxesLevels.length === checkboxOptionsLevels.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
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
                  : setSelectedCheckboxesDiscipline(checkboxOptionsDiscipline)
              }
            >
              {selectedCheckboxesDiscipline.length ===
              checkboxOptionsDiscipline.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
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
      </div>
    </>
  );
};
