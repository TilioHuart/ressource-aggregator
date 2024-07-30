import { emptySplitApi } from "./emptySplitApi.service";

export const searchApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query({
      query: ({ jsondata, idStructure }) => ({
        url: `search?jsondata=${encodeURI(
          JSON.stringify(jsondata),
        )}&structureIds=${encodeURI(JSON.stringify(idStructure))}`,
      }),
    }),
  }),
});

export const { useSearchQuery } = searchApi;
