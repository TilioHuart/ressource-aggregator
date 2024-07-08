export interface Resource {
  authors: string[];
  disciplines: string[];
  document_types: string[];
  editors: string[];
  favorite: boolean;
  image: string;
  levels: string[];
  plain_text: string[] | string;
  source: string;
  title: string;
  is_textbook?: boolean;
}
