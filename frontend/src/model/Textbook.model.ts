import { Resource } from "./Resource.model";

export interface Textbook extends Resource {
  date: number;
  structure_name: string;
  structure_uai: string;
  user: string;
  _id: string;
}
