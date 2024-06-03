import { FieldData } from "./FieldData";
import { AdvancedSearchEnum } from "../core/enum/advanced-search.enum";

export type AdvancedSearchData = { [key in AdvancedSearchEnum]?: FieldData };
