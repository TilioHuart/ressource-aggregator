import React, { useCallback, useEffect, useState } from "react";

import { Dropdown } from "@edifice-ui/react";
import "../filter-layout/FilterLayout.scss";
import { useTranslation } from "react-i18next";

import { SearchResultData } from "~/model/SearchResultData.model";
import { Textbook } from "~/model/Textbook.model";

interface FilterTextbookLayoutProps {
  resources: Textbook[];
  disciplines: string[];
  levels: string[];
  setAllResourcesDisplayed: React.Dispatch<
    React.SetStateAction<SearchResultData>
  >;
}

export const FilterTextbookLayout: React.FC<FilterTextbookLayoutProps> = ({
  resources,
  disciplines,
  levels,
  setAllResourcesDisplayed,
}) => {
  const { t } = useTranslation();
  const [selectedCheckboxesLevels, setSelectedCheckboxesLevels] =
    useState<string[]>(levels);
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
        return matchesDiscipline || matchesLevel;
      });
    };
    filteredResources.externals_resources = filterByCriteria(
      filteredResources.externals_resources,
      selectedCheckboxesDiscipline,
      selectedCheckboxesLevels,
    );
    setAllResourcesDisplayed(filteredResources);
  }, [
    selectedCheckboxesDiscipline,
    selectedCheckboxesLevels,
    setAllResourcesDisplayed,
    resources,
  ]);

  const checkboxOptionsDiscipline = disciplines ?? [];
  const checkboxOptionsLevels = levels ?? [];

  const countLevels = selectedCheckboxesLevels.length;
  const countDisciplines = selectedCheckboxesDiscipline.length;

  useEffect(() => {
    setSelectedCheckboxesDiscipline(disciplines);
    setSelectedCheckboxesLevels(levels);
    setAllResourcesDisplayed({
      signets: [],
      moodle: [],
      externals_resources: resources,
    });
  }, [resources, disciplines, levels, setAllResourcesDisplayed]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    setAllResourcesDisplayed({
      signets: [],
      moodle: [],
      externals_resources: resources,
    });
  }, [resources, setAllResourcesDisplayed]);

  return (
    <>
      <div className="med-filters">
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
                  : setSelectedCheckboxesDiscipline(checkboxOptionsDiscipline)
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
      </div>
    </>
  );
};
