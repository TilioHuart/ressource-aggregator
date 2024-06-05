import { SearchResultDataCategory } from "./SearchResultDataCategory.model";

export type SearchResultCategory = {
  event: string;
  state: string;
  status: string;
  data: SearchResultDataCategory;
};
