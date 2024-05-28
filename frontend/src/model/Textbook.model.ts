import { Resource } from "./Resource.model";

export interface Textbook extends Resource {
  authors: string[];
  date: number;
  link: string;
  structure_name: string;
  structure_uai: string;
  user: string;
  _id: string;
}
