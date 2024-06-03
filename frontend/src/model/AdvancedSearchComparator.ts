import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";

export type advancedSearchComparator = {
  [key in AdvancedSearchEnum]?: "$or" | "$and";
};
