import { emptySplitApi } from "./emptySplitApi.service";

export const favoriteApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorite: builder.query({
      query: () => "favorites",
    }),
  }),
});

export const { useGetFavoriteQuery } = favoriteApi;
