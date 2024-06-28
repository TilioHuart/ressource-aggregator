import { Resource } from "./Resource.model";

export interface Moodle extends Resource {
  action: any;
  date: number;
  description: string;
  favoriteId?: string;
  id: string;
}
