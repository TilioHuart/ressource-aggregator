import { emptySplitApi } from "./emptySplitApi.service";

export const textbooksApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getTextbooks: builder.query({
      query: (idStructure) => ({
        url: `textbooks/refresh?structureIds=${encodeURI(
          JSON.stringify(idStructure),
        )}`,
      }),
    }),
  }),
});

export const { useGetTextbooksQuery } = textbooksApi;
