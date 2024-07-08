import { useEffect, useState } from "react";

import { Resource } from "~/model/Resource.model";

// this kook get all information about a list of resources and it's used in the FilterLayout component
export const useResourceListInfo = (resources: Resource[] | null) => {
  const [textbooks, setTextbooks] = useState<Resource[]>([]);
  const [externalResources, setExternalResources] = useState<Resource[]>([]);
  const [moodle, setMoodle] = useState<Resource[]>([]);
  const [signets, setSignets] = useState<Resource[]>([]);

  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  const [containTextbook, setContainTextbook] = useState<boolean>(false);
  const [containExternalResource, setContainExternalResource] =
    useState<boolean>(false);
  const [containMoodle, setContainMoodle] = useState<boolean>(false);
  const [containSignet, setContainSignet] = useState<boolean>(false);

  useEffect(() => {
    if (!resources) return;
    const textbooksTemp: Resource[] = [];
    const externalResourcesTemp: Resource[] = [];
    const moodleTemp: Resource[] = [];
    const signetsTemp: Resource[] = [];

    const disciplinesTemp: string[] = [];
    const levelsTemp: string[] = [];
    const typesTemp: string[] = [];

    const isTextbook = (resource: Resource) =>
      resource.source === "fr.openent.mediacentre.source.GAR" &&
      (resource?.is_textbook ?? false);
    const isExternalResource = (resource: Resource) =>
      resource.source === "fr.openent.mediacentre.source.GAR" &&
      (!resource?.is_textbook ?? true);
    const isMoodle = (resource: Resource) =>
      resource.source === "fr.openent.mediacentre.source.Moodle";
    const isSignet = (resource: Resource) =>
      resource.source === "fr.openent.mediacentre.source.Signet";

    resources.forEach((resource) => {
      // Case textbook
      if (isTextbook(resource)) {
        textbooksTemp.push(resource);
      }
      // Case external resource
      else if (isExternalResource(resource)) {
        externalResourcesTemp.push(resource);
        resource.document_types.forEach((type) => {
          if (!typesTemp.includes(type)) typesTemp.push(type); // we want types only from external resources
        });
      }
      // Case moodle
      else if (isMoodle(resource)) {
        moodleTemp.push(resource);
      }
      // Case signet
      else if (isSignet(resource)) {
        signetsTemp.push(resource);
      }
      resource.disciplines.forEach((discipline) => {
        if (!disciplinesTemp.includes(discipline))
          disciplinesTemp.push(discipline); // we want disciplines from all resources
      });
      resource.levels.forEach((level) => {
        if (!levelsTemp.includes(level)) levelsTemp.push(level); // we want levels from all resources
      });
    });

    setTextbooks(textbooksTemp);
    setExternalResources(externalResourcesTemp);
    setMoodle(moodleTemp);
    setSignets(signetsTemp);

    setDisciplines(disciplinesTemp);
    setLevels(levelsTemp);
    setTypes(typesTemp);

    setContainTextbook(textbooksTemp.length > 0);
    setContainExternalResource(externalResourcesTemp.length > 0);
    setContainMoodle(moodleTemp.length > 0);
    setContainSignet(signetsTemp.length > 0);
  }, [resources]);

  return {
    textbooks,
    externalResources,
    moodle,
    signets,
    disciplines,
    levels,
    types,
    containTextbook,
    containExternalResource,
    containMoodle,
    containSignet,
  };
};
