import { Moodle } from "./Moodle.model";
import { Signet } from "./Signet.model";
import { Textbook } from "./Textbook.model";

export interface SearchResultData {
  signets: Signet[];
  moodle: Moodle[];
  textbooks: Textbook[];
  externals_resources: Textbook[];
}
