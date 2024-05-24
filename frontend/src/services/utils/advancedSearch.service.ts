import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import { SEARCH_TYPE } from "~/core/enum/search-type.enum";
import { AdvancedSearchData } from "~/model/AdvancedSearchData";
import { FieldData } from "~/model/FieldData";
import { isFieldData } from "~/services/utils/fieldData.service";

export const createEmptyAdvancedSearchData = (): AdvancedSearchData => {
  return {
    title: undefined,
    authors: undefined,
    editors: undefined,
    disciplines: undefined,
    levels: undefined,
  };
};

export const toJson = (advancedSearchData: AdvancedSearchData): any => {
  const jsonAdvancedSearch: any = {};

  if (advancedSearchData.title && advancedSearchData.title.value !== "")
    jsonAdvancedSearch.title = advancedSearchData.title.toJson();
  if (advancedSearchData.authors && advancedSearchData.authors.value !== "")
    jsonAdvancedSearch.authors = advancedSearchData.authors.toJson();
  if (advancedSearchData.editors && advancedSearchData.editors.value !== "")
    jsonAdvancedSearch.editors = advancedSearchData.editors.toJson();
  if (
    advancedSearchData.disciplines &&
    advancedSearchData.disciplines.value !== ""
  )
    jsonAdvancedSearch.disciplines = advancedSearchData.disciplines.toJson();
  if (advancedSearchData.levels && advancedSearchData.levels.value !== "")
    jsonAdvancedSearch.levels = advancedSearchData.levels.toJson();

  return jsonAdvancedSearch;
};

export const addFieldData = (
  advancedSearchData: AdvancedSearchData,
  fieldData: FieldData,
  type: AdvancedSearchEnum,
): void => {
  switch (type) {
    case AdvancedSearchEnum.title:
      advancedSearchData.title = fieldData;
      break;
    case AdvancedSearchEnum.author:
      advancedSearchData.authors = fieldData;
      break;
    case AdvancedSearchEnum.editor:
      advancedSearchData.editors = fieldData;
      break;
    case AdvancedSearchEnum.discipline:
      advancedSearchData.disciplines = fieldData;
      break;
    case AdvancedSearchEnum.level:
      advancedSearchData.levels = fieldData;
      break;
  }
};

export const isAdvancedSearchData = (
  advancedSearchData: AdvancedSearchData,
): boolean => {
  return (
    (!!advancedSearchData.title && !!advancedSearchData.title.value) ||
    (!!advancedSearchData.authors && isFieldData(advancedSearchData.authors)) ||
    (!!advancedSearchData.editors && isFieldData(advancedSearchData.editors)) ||
    (!!advancedSearchData.disciplines &&
      isFieldData(advancedSearchData.disciplines)) ||
    (!!advancedSearchData.levels && isFieldData(advancedSearchData.levels))
  );
};

export const generateAdvancedSearchParam = (
  advancedSearchData: AdvancedSearchData,
  sources: string[],
): object => {
  return {
    state: SEARCH_TYPE.ADVANCED,
    data: advancedSearchData,
    event: "search",
    sources: sources,
  };
};
