import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const kbApi = createApi({
  reducerPath: "kbApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["KB"],
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: (params) => ({
        url: "/kb",
        method: "get",
        params,
      }),
      providesTags: ["KB"],
    }),
    createArticle: builder.mutation({
      query: (body) => ({ url: "/kb", method: "post", data: body }),
      invalidatesTags: ["KB"],
    }),
    getArticle: builder.query({
      query: (id) => ({ url: `/kb/${id}`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "KB", id }],
    }),
    updateArticle: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/kb/${id}`,
        method: "put",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => ["KB", { type: "KB", id: arg.id }],
    }),
    deleteArticle: builder.mutation({
      query: (id) => ({ url: `/kb/${id}`, method: "delete" }),
      invalidatesTags: ["KB"],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useLazyGetArticlesQuery,
  useCreateArticleMutation,
  useGetArticleQuery,
  useLazyGetArticleQuery,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = kbApi;
