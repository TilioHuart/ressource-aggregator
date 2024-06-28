import { ExternalResource } from "./ExternalResource.model";

export interface GlobalResource extends ExternalResource {
  _id: string;
  profiles: string[];
}
