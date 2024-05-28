import { Resource } from "./Resource.model";

export interface Favorite extends Resource {
  authors: string[];
  description: string;
  date: number;
  user?: string;
  _id?: string;
  hash?: number;
  link: string;
}
