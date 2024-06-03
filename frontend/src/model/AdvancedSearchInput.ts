import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";

export type advancedSearchInput = {
  [key in AdvancedSearchEnum]?: string;
};
