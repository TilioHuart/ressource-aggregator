import { Resource } from "./Resource.model";

export interface Favorite extends Resource {
  link?: string;
  id?: string | number;
  _id?: string;
  date?: number;
  favoriteId?: string;
  structure_name?: string;
  structure_uai?: string;
  user?: string;
  action?: any;
  description?: string;
  profiles?: string[];
  date_modification?: number;
  date_creation?: number;
  resource_id?: string;
  owner_id?: string;
  owner_name?: string;
  url?: string;
  shared?: boolean;
  archived?: boolean;
  orientation?: boolean;
  published?: boolean;
  collab?: boolean;
} // fav can be any resource
