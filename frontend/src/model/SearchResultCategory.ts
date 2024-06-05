import { SearchResultDataCategory } from "./SearchResultDataCategory";

export type SearchResultCategory = {
  event: string;
  state: string;
  status: string;
  data: SearchResultDataCategory;
};
