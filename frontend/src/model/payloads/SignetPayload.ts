export interface SignetPayload {
  id: string;
  title: string;
  levels: { id: string; label: string }[];
  disciplines: { id: string; label: string }[];
  url: string;
  image: string;
  plain_text: { label: string }[];
  orientation: boolean;
}
