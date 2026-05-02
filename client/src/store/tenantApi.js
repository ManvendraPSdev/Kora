import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const tenantApi = createApi({
  reducerPath: "tenantApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Tenant"],
  endpoints: (builder) => ({
    getTenant: builder.query({
      query: (id) => ({ url: `/tenant/${id}`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "Tenant", id }],
    }),
    updateTenant: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tenant/${id}`,
        method: "put",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Tenant", id: arg.id }],
    }),
    updateAIConfig: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tenant/${id}/ai-config`,
        method: "put",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Tenant", id: arg.id }],
    }),
  }),
});

export const {
  useGetTenantQuery,
  useLazyGetTenantQuery,
  useUpdateTenantMutation,
  useUpdateAIConfigMutation,
} = tenantApi;
