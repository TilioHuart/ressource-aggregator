import { Resource } from "./Resource.model";

export interface ExternalResource extends Resource {
  date: number;
  favoriteId?: string;
  id: string | number;
  link: string;
  structure_name: string;
  structure_uai: string;
  user?: string;
}
