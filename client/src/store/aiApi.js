import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AISuggestions", "AIAnalytics"],
  endpoints: (builder) => ({
    getSuggestedReplies: builder.query({
      query: (ticketId) => ({
        url: `/ai/suggest-reply/${ticketId}`,
        method: "get",
      }),
      providesTags: (_result, _error, ticketId) => [
        { type: "AISuggestions", id: ticketId },
      ],
    }),
    categorize: builder.mutation({
      query: (body) => ({
        url: "/ai/categorize",
        method: "post",
        data: body,
      }),
    }),
    getAIAnalytics: builder.query({
      query: (params) => ({
        url: "/ai/analytics",
        method: "get",
        params,
      }),
      providesTags: ["AIAnalytics"],
    }),
  }),
});

export const {
  useGetSuggestedRepliesQuery,
  useLazyGetSuggestedRepliesQuery,
  useCategorizeMutation,
  useGetAIAnalyticsQuery,
  useLazyGetAIAnalyticsQuery,
} = aiApi;
