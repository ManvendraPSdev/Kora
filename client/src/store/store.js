import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../state/slices/authSlice";
import workspaceReducer from "../state/slices/workspaceSlice";
import { ticketApi } from "./ticketApi";
import { chatApi } from "./chatApi";
import { userApi } from "./userApi";
import { analyticsApi } from "./analyticsApi";
import { kbApi } from "./kbApi";
import { tenantApi } from "./tenantApi";
import { aiApi } from "./aiApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [kbApi.reducerPath]: kbApi.reducer,
    [tenantApi.reducerPath]: tenantApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ticketApi.middleware,
      chatApi.middleware,
      userApi.middleware,
      analyticsApi.middleware,
      kbApi.middleware,
      tenantApi.middleware,
      aiApi.middleware
    ),
});
