import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ChatSessions", "ChatMessages"],
  endpoints: (builder) => ({
    startSession: builder.mutation({
      query: (body) => ({ url: "/chat/session", method: "post", data: body }),
      invalidatesTags: ["ChatSessions"],
    }),
    getSession: builder.query({
      query: (id) => ({ url: `/chat/session/${id}`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "ChatSessions", id }],
    }),
    getSessionMessages: builder.query({
      query: (id) => ({ url: `/chat/session/${id}/messages`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "ChatMessages", id }],
    }),
    sendMessage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/chat/session/${id}/message`,
        method: "post",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "ChatMessages", id: arg.id }],
    }),
    closeSession: builder.mutation({
      query: (id) => ({
        url: `/chat/session/${id}/close`,
        method: "put",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "ChatSessions", id }],
    }),
    getAllSessions: builder.query({
      query: (params) => ({
        url: "/chat/sessions",
        method: "get",
        params,
      }),
      providesTags: ["ChatSessions"],
    }),
  }),
});

export const {
  useStartSessionMutation,
  useGetSessionQuery,
  useLazyGetSessionQuery,
  useGetSessionMessagesQuery,
  useLazyGetSessionMessagesQuery,
  useSendMessageMutation,
  useCloseSessionMutation,
  useGetAllSessionsQuery,
  useLazyGetAllSessionsQuery,
} = chatApi;
