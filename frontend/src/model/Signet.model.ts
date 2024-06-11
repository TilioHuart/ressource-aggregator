import { Resource } from "./Resource.model";

export interface Signet extends Resource {
  archived: boolean;
  collab: boolean;
  date_creation: string;
  date_modification: string;
  published: boolean;
  orientation?: boolean;
  resource_id: string;
  owner_id: string;
  owner_name: string;
  url?: string;
  _id?: string;
  shared?: boolean;
}
