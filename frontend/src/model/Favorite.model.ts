import { Resource } from "./Resource.model";

export interface Favorite extends Resource {
  description: string;
  date: number;
  user?: string;
  _id?: string;
  hash?: number;
}
