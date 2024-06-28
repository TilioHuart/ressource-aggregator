import { Resource } from "./Resource.model";

export interface Textbook extends Resource {
  link: string;
  id: string | number;
  date: number;
  favoriteId?: string;
  structure_name: string;
  structure_uai: string;
  user?: string;
}
