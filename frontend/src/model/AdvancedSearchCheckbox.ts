import { AdvancedSearchSourcesEnum } from "~/core/enum/advanced-search-sources.enum";

export type advancedSearchCheckbox = {
  [key in AdvancedSearchSourcesEnum]: boolean;
};
