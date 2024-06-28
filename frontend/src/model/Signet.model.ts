import { Resource } from "./Resource.model";

export interface Signet extends Resource {
  description: string;
  date?: number;
  date_modification?: number;
  date_creation?: number;
  id: string | number;
  _id?: string;
  resource_id?: string;
  owner_id?: string;
  owner_name?: string;
  link?: string;
  url?: string;
  shared?: boolean;
  archived?: boolean;
  orientation?: boolean;
  published?: boolean;
  collab?: boolean;
}
