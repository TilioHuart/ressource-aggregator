import { emptySplitApi } from "./emptySplitApi.service";

export const signetsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedSignets: builder.query({
      query: () => "signets",
    }),
    getMySignets: builder.query({
      query: () => "mysignets",
    }),
    createSignet: builder.mutation({
      query: ({ payload }) => ({
        url: `signets`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetPublishedSignetsQuery,
  useGetMySignetsQuery,
  useCreateSignetMutation,
} = signetsApi;
