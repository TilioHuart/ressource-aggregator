export interface Resource {
  disciplines: string[];
  document_types: string[];
  editors: string[];
  favorite?: boolean;
  image: string;
  levels: string[];
  plain_text: string | string[] | string[][];
  source: string;
  title: string;
  id?: string;
}
