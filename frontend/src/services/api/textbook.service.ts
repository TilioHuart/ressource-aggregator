import { emptySplitApi } from "./emptySplitApi.service";

export const textbooksApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getTextbooks: builder.query({
      query: () => "textbooks/refresh",
    }),
  }),
});

export const { useGetTextbooksQuery } = textbooksApi;
