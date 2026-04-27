import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/auth.service";

const STORAGE_KEY = "support-platform-auth";

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function hydrateUser(accessToken, user) {
  const payload = decodeJwt(accessToken);
  return {
    id: user?._id || payload?.id,
    name: user?.name || "Workspace user",
    email: user?.email || "",
    role: user?.role || payload?.role,
    tenantId: user?.tenantId || payload?.tenantId,
  };
}

function initialStateFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: "", user: null, loading: false, error: "" };
  const parsed = JSON.parse(raw);
  return { ...parsed, loading: false, error: "" };
}

export const loginThunk = createAsyncThunk("auth/login", async (payload) => {
  const data = await authService.login(payload);
  return { token: data.accessToken, user: hydrateUser(data.accessToken, data.user) };
});

export const registerThunk = createAsyncThunk("auth/register", async (payload) => {
  const data = await authService.register(payload);
  return { token: data.accessToken, user: hydrateUser(data.accessToken, data.user) };
});

export const logoutThunk = createAsyncThunk("auth/logout", async (_payload, { getState }) => {
  const token = getState().auth.token;
  if (token) {
    await authService.logout(token);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: initialStateFromStorage(),
  reducers: {
    clearAuthError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Register failed";
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = "";
        state.user = null;
        state.loading = false;
        state.error = "";
        localStorage.removeItem(STORAGE_KEY);
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
