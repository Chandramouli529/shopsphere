import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { safeSetItem, safeGetItem, safeDeleteItem } from "@/services/secureStorage";
import { adminApi, type AdminData } from "@/services/adminApi";

const ADMIN_TOKEN_KEY = "shopsphere_admin_access_token";

interface AdminAuthState {
  status: "idle" | "loading" | "authenticated";
  admin: AdminData | null;
  accessToken: string | null;
  error: string | null;
}

const initialState: AdminAuthState = {
  status: "idle",
  admin: null,
  accessToken: null,
  error: null,
};

/** No hardcoded credentials — this calls the real backend
 * (POST /auth/admin/login) with whatever email/password the admin
 * enters. Whether login succeeds is entirely up to the backend. */
export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await adminApi.login(data);
      if (response.token) {
        await safeSetItem(ADMIN_TOKEN_KEY, response.token);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Admin login failed"
      );
    }
  }
);

export const adminRestoreSession = createAsyncThunk(
  "adminAuth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const token = await safeGetItem(ADMIN_TOKEN_KEY);
      if (!token) {
        return rejectWithValue("No stored admin session");
      }
      const profile = await adminApi.getProfile();
      return { token, admin: profile.admin || profile };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to restore admin session"
      );
    }
  }
);

export const adminLogout = createAsyncThunk("adminAuth/logout", async () => {
  await safeDeleteItem(ADMIN_TOKEN_KEY);
});

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.admin = action.payload.admin;
        state.accessToken = action.payload.token;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(adminRestoreSession.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.admin = action.payload.admin;
        state.accessToken = action.payload.token;
      })
      .addCase(adminRestoreSession.rejected, (state) => {
        state.status = "idle";
        state.admin = null;
        state.accessToken = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.status = "idle";
        state.admin = null;
        state.accessToken = null;
      });
  },
});

export const { clearAdminError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;