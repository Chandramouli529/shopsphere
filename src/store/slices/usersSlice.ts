import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "@/services/adminApi";

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  /** Only ever populated for the old local-only mock flow. A real
   * backend must never return a password (plain or hashed) to the
   * client at all — real registered users fetched from the API will
   * always have this as undefined. */
  password?: string;
  role: "customer";
  /** Admin-set — a blocked user's login should be refused. Enforcement of
   * that lives in authSlice's loginWithPassword thunk. */
  blocked: boolean;
  joinedAt: number;
}

export interface PendingRegistration {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

interface UsersState {
  users: RegisteredUser[];
  pendingRegistration: PendingRegistration | null;
  passwordResetEmail: string | null;
  fetchStatus: "idle" | "loading" | "failed";
  fetchError: string | null;
}

const initialState: UsersState = {
  users: [],
  pendingRegistration: null,
  passwordResetEmail: null,
  fetchStatus: "idle",
  fetchError: null,
};

/** Real registered customers, from admin's user list. GUESSED endpoint
 * (GET /admin/users) — no confirmed real URL yet, so this may need its
 * path adjusted once one is provided. */
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUsers();
      const list = response.users || response.data || response;
      const rawUsers = Array.isArray(list) ? list : [];
      return rawUsers.map(
        (raw: any): RegisteredUser => ({
          id: raw._id || raw.id || `unknown_${raw.email ?? Math.random()}`,
          firstName: raw.firstName || "",
          lastName: raw.lastName || "",
          email: raw.email || "",
          mobileNumber: raw.mobileNumber || raw.mobile || "",
          role: "customer",
          blocked: raw.blocked ?? raw.isBlocked ?? false,
          joinedAt: raw.createdAt || raw.joinedAt ? new Date(raw.createdAt || raw.joinedAt).getTime() : Date.now(),
        })
      );
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not load users"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setPendingRegistration(state, action: PayloadAction<PendingRegistration>) {
      state.pendingRegistration = action.payload;
    },
    clearPendingRegistration(state) {
      state.pendingRegistration = null;
    },
    commitPendingRegistration(state) {
      if (!state.pendingRegistration) return;
      const { firstName, lastName, email, mobileNumber, password } = state.pendingRegistration;
      state.users.push({
        id: "usr_" + Date.now(),
        firstName,
        lastName,
        email: email.toLowerCase(),
        mobileNumber,
        password,
        role: "customer",
        blocked: false,
        joinedAt: Date.now(),
      });
      state.pendingRegistration = null;
    },
    setPasswordResetEmail(state, action: PayloadAction<string | null>) {
      state.passwordResetEmail = action.payload;
    },
    setUserPassword(state, action: PayloadAction<{ email: string; newPassword: string }>) {
      const user = state.users.find((u) => u.email === action.payload.email.toLowerCase());
      if (user) user.password = action.payload.newPassword;
    },
    blockUser(state, action: PayloadAction<string>) {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) user.blocked = true;
    },
    unblockUser(state, action: PayloadAction<string>) {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) user.blocked = false;
    },
    deleteUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.fetchStatus = "idle";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = (action.payload as string) ?? "Could not load users";
      });
  },
});

export const {
  setPendingRegistration,
  clearPendingRegistration,
  commitPendingRegistration,
  setPasswordResetEmail,
  setUserPassword,
  blockUser,
  unblockUser,
  deleteUser,
} = usersSlice.actions;
export default usersSlice.reducer;