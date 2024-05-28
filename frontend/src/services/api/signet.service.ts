import { emptySplitApi } from "./emptySplitApi.service";

export const signetsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedSignets: builder.query({
      query: () => "signets",
    }),
    getMySignets: builder.query({
      query: () => "mysignets",
    }),
  }),
});

export const { useGetPublishedSignetsQuery, useGetMySignetsQuery } = signetsApi;
