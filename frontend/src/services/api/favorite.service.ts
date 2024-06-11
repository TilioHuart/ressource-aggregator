import { emptySplitApi } from "./emptySplitApi.service";

export const favoriteApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorite: builder.query({
      query: () => "favorites",
    }),
    addFavorite: builder.mutation({
      query: ({ id, resource }: { id: string | number; resource: any }) => ({
        url: `favorites?id=${id}`,
        method: "POST",
        body: { ...resource },
      }),
    }),
    removeFavorite: builder.mutation({
      query: ({ id, source }: { id: string | number; source: string }) => ({
        url: `favorites?id=${id}&source=${source}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetFavoriteQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoriteApi;
