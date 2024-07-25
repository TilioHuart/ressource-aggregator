import { Resource } from "~/model/Resource.model";

// return a new list of resources sorted by alphabet
export const sortByAlphabet = (resources: Resource[]) => {
  if (!resources || !resources.length) {
    return [];
  }
  return [...resources].sort((a, b) => {
    const titleA = a.title.toLowerCase(); // to avoid having "Z" before "a"
    const titleB = b.title.toLowerCase(); // to avoid having "Z" before "a"
    if (titleA < titleB) {
      return -1;
    }
    if (titleA > titleB) {
      return 1;
    }
    return 0;
  });
};
