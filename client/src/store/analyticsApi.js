import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: (params) => ({
        url: "/analytics/overview",
        method: "get",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    getAgentPerformance: builder.query({
      query: (params) => ({
        url: "/analytics/agent-performance",
        method: "get",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    getAIStats: builder.query({
      query: (params) => ({
        url: "/analytics/ai-stats",
        method: "get",
        params,
      }),
      providesTags: ["Analytics"],
    }),
    getTrends: builder.query({
      query: (params) => ({
        url: "/analytics/trends",
        method: "get",
        params,
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useLazyGetOverviewQuery,
  useGetAgentPerformanceQuery,
  useLazyGetAgentPerformanceQuery,
  useGetAIStatsQuery,
  useLazyGetAIStatsQuery,
  useGetTrendsQuery,
  useLazyGetTrendsQuery,
} = analyticsApi;
