import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Tickets", "Messages"],
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params) => ({
        url: "/tickets",
        method: "get",
        params,
      }),
      providesTags: ["Tickets"],
    }),
    getTicket: builder.query({
      query: (id) => ({ url: `/tickets/${id}`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "Tickets", id }],
    }),
    createTicket: builder.mutation({
      query: (body) => ({ url: "/tickets", method: "post", data: body }),
      invalidatesTags: ["Tickets"],
    }),
    assignTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tickets/${id}/assign`,
        method: "put",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Tickets", id: arg.id }],
    }),
    changeStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tickets/${id}/status`,
        method: "put",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Tickets", id: arg.id }, "Tickets"],
    }),
    deleteTicket: builder.mutation({
      query: (id) => ({ url: `/tickets/${id}`, method: "delete" }),
      invalidatesTags: ["Tickets"],
    }),
    getTicketMessages: builder.query({
      query: (id) => ({ url: `/tickets/${id}/messages`, method: "get" }),
      providesTags: (_result, _error, id) => [{ type: "Messages", id }],
    }),
    addTicketMessage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tickets/${id}/messages`,
        method: "post",
        data: body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Messages", id: arg.id }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useLazyGetTicketsQuery,
  useGetTicketQuery,
  useLazyGetTicketQuery,
  useCreateTicketMutation,
  useAssignTicketMutation,
  useChangeStatusMutation,
  useDeleteTicketMutation,
  useGetTicketMessagesQuery,
  useLazyGetTicketMessagesQuery,
  useAddTicketMessageMutation,
} = ticketApi;

/*
  USAGE EXAMPLE:

  import { useGetTicketsQuery, useCreateTicketMutation } from '../store/ticketApi';

  const { data, isLoading, isError } = useGetTicketsQuery({ status: 'open', page: 1 });

  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  await createTicket({ title: 'My issue', description: '...', priority: 'high' });
*/
