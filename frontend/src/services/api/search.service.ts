import { emptySplitApi } from "./emptySplitApi.service";

export const searchApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query({
      query: (query) => ({
        url: `search?jsondata=${encodeURI(JSON.stringify(query))}`,
      }),
    }),
  }),
});

export const { useSearchQuery } = searchApi;
