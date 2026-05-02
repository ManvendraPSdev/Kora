import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Users", "Agents"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: "/users",
        method: "get",
        params,
      }),
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: "/users", method: "post", data: body }),
      invalidatesTags: ["Users"],
    }),
    getUser: builder.query({
      query: (id) => ({ url: `/users/${id}`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "put",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Users", id: arg.id }, "Users"],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "delete" }),
      invalidatesTags: ["Users"],
    }),
    getAvailableAgents: builder.query({
      query: (params) => ({
        url: "/users/agents/available",
        method: "get",
        params,
      }),
      providesTags: ["Agents"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useCreateUserMutation,
  useGetUserQuery,
  useLazyGetUserQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useGetAvailableAgentsQuery,
  useLazyGetAvailableAgentsQuery,
} = userApi;
