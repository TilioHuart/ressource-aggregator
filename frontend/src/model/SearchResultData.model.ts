import { ExternalResource } from "./ExternalResource.model";
import { Moodle } from "./Moodle.model";
import { Signet } from "./Signet.model";

export interface SearchResultData {
  signets: Signet[];
  moodle: Moodle[];
  externals_resources: ExternalResource[];
}
