import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { analyticsService } from "../../services/analytics.service";
import { ticketService } from "../../services/ticket.service";
import { kbService } from "../../services/kb.service";
import { userService } from "../../services/user.service";
import { tenantService } from "../../services/tenant.service";
import { chatService } from "../../services/chat.service";
import { aiService } from "../../services/ai.service";
import { authService } from "../../services/auth.service";


const initialState = {
  activeSection: "tickets",
  loading: false,
  error: "",
  success: "",
  overview: null,
  tickets: [],
  selectedTicketId: "",
  ticketMessages: [],
  suggestedReplies: [],
  kbArticles: [],
  users: [],
  tenants: [],
  chatSession: null,
  chatMessages: [],
};

const withToken = (getState) => getState().auth.token;

export const bootstrapWorkspaceThunk = createAsyncThunk(
  "workspace/bootstrap",
  async (_payload, { getState }) => {
    const token = withToken(getState);
    const role = getState().auth.user?.role;
    const [tickets, kbArticles, overview, users, tenants] = await Promise.all([
      ticketService.list(token),
      kbService.list(token),
      role === "admin" || role === "super_admin" ? analyticsService.overview(token) : Promise.resolve(null),
      role === "admin" || role === "super_admin" ? userService.list(token) : Promise.resolve(null),
      role === "super_admin" ? tenantService.list(token) : Promise.resolve(null),
    ]);

    return {
      tickets: tickets?.tickets || [],
      kbArticles: kbArticles?.articles || [],
      overview,
      users: users?.users || [],
      tenants: tenants?.tenants || [],
    };
  }
);

export const createTicketThunk = createAsyncThunk("workspace/createTicket", async (payload, { getState }) => {
  const token = withToken(getState);
  await ticketService.create(payload, token);
  return ticketService.list(token);
});

export const selectTicketThunk = createAsyncThunk("workspace/selectTicket", async (ticketId, { getState }) => {
  const token = withToken(getState);
  const result = await ticketService.messages(ticketId, token);
  return { ticketId, messages: result.messages || [] };
});

export const addTicketMessageThunk = createAsyncThunk(
  "workspace/addTicketMessage",
  async ({ ticketId, content }, { getState }) => {
    const token = withToken(getState);
    await ticketService.addMessage(ticketId, content, token);
    const [messages, tickets] = await Promise.all([
      ticketService.messages(ticketId, token),
      ticketService.list(token),
    ]);
    return { ticketId, messages: messages.messages || [], tickets: tickets.tickets || [] };
  }
);

export const updateTicketStatusThunk = createAsyncThunk(
  "workspace/updateTicketStatus",
  async ({ ticketId, status }, { getState }) => {
    const token = withToken(getState);
    await ticketService.updateStatus(ticketId, status, token);
    const [messages, tickets] = await Promise.all([
      ticketService.messages(ticketId, token),
      ticketService.list(token),
    ]);
    return { ticketId, messages: messages.messages || [], tickets: tickets.tickets || [] };
  }
);

export const suggestRepliesThunk = createAsyncThunk("workspace/suggestReplies", async (ticketId, { getState }) => {
  const token = withToken(getState);
  const data = await aiService.suggestReplies(ticketId, token);
  return data.suggestions || [];
});

export const createKbArticleThunk = createAsyncThunk("workspace/createKb", async (payload, { getState }) => {
  const token = withToken(getState);
  await kbService.create(payload, token);
  return kbService.list(token);
});

export const createUserThunk = createAsyncThunk("workspace/createUser", async (payload, { getState }) => {
  const token = withToken(getState);
  await userService.create(payload, token);
  return userService.list(token);
});

export const startChatSessionThunk = createAsyncThunk("workspace/startChat", async (_payload, { getState }) => {
  const token = withToken(getState);
  const data = await chatService.startSession(token);
  return data.session;
});

export const sendChatMessageThunk = createAsyncThunk(
  "workspace/sendChatMessage",
  async ({ sessionId, content }, { getState }) => {
    const token = withToken(getState);
    const data = await chatService.sendMessage(sessionId, content, token);
    return data;
  }
);

export const forgotPasswordThunk = createAsyncThunk("workspace/forgotPassword", async (email) => {
  await authService.forgotPassword(email);
  return "If account exists, reset was requested.";
});

export const resetPasswordThunk = createAsyncThunk("workspace/resetPassword", async (payload) => {
  await authService.resetPassword(payload);
  return "Password reset completed.";
});

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveSection(state, action) {
      state.activeSection = action.payload;
    },
    clearWorkspaceFlash(state) {
      state.error = "";
      state.success = "";
    },
    resetWorkspaceState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapWorkspaceThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(bootstrapWorkspaceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.kbArticles = action.payload.kbArticles;
        state.overview = action.payload.overview;
        state.users = action.payload.users;
        state.tenants = action.payload.tenants;
        state.selectedTicketId = action.payload.tickets[0]?._id || "";
      })
      .addCase(bootstrapWorkspaceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load workspace";
      })
      .addCase(createTicketThunk.fulfilled, (state, action) => {
        state.tickets = action.payload.tickets || [];
        state.selectedTicketId = state.tickets[0]?._id || "";
        state.success = "Ticket created.";
      })
      .addCase(selectTicketThunk.fulfilled, (state, action) => {
        state.selectedTicketId = action.payload.ticketId;
        state.ticketMessages = action.payload.messages;
      })
      .addCase(addTicketMessageThunk.fulfilled, (state, action) => {
        state.ticketMessages = action.payload.messages;
        state.tickets = action.payload.tickets;
        state.success = "Message sent.";
      })
      .addCase(updateTicketStatusThunk.fulfilled, (state, action) => {
        state.ticketMessages = action.payload.messages;
        state.tickets = action.payload.tickets;
        state.success = "Status updated.";
      })
      .addCase(suggestRepliesThunk.fulfilled, (state, action) => {
        state.suggestedReplies = action.payload;
        state.success = "Suggestions generated.";
      })
      .addCase(createKbArticleThunk.fulfilled, (state, action) => {
        state.kbArticles = action.payload.articles || [];
        state.success = "KB article created.";
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.users = action.payload.users || [];
        state.success = "User created.";
      })
      .addCase(startChatSessionThunk.fulfilled, (state, action) => {
        state.chatSession = action.payload;
        state.chatMessages = [];
        state.success = "AI chat session started.";
      })
      .addCase(sendChatMessageThunk.fulfilled, (state, action) => {
        const items = [];
        if (action.payload.userMessage) items.push(action.payload.userMessage);
        if (action.payload.aiMessage) items.push(action.payload.aiMessage);
        state.chatMessages.push(...items);
        state.success = action.payload.ticketId
          ? "Escalated to human ticket."
          : "AI response received.";
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.success = action.payload;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.success = action.payload;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("workspace/") &&
          action.type.endsWith("/pending") &&
          action.type !== bootstrapWorkspaceThunk.pending.type,
        (state) => {
          state.loading = true;
          state.error = "";
          state.success = "";
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("workspace/") &&
          action.type.endsWith("/fulfilled") &&
          action.type !== bootstrapWorkspaceThunk.fulfilled.type,
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("workspace/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Operation failed";
        }
      );
  },
});

export const { setActiveSection, clearWorkspaceFlash, resetWorkspaceState } = workspaceSlice.actions;
export default workspaceSlice.reducer;
