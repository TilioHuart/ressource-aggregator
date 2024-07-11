import { emptySplitApi } from "./emptySplitApi.service";

export const pinsApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getPins: builder.query({
      query: (idStructure: string) => `structures/${idStructure}/pins`,
    }),
  }),
});

export const { useGetPinsQuery } = pinsApi;
