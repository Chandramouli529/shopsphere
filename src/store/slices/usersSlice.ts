import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  /** Stored in plain text ONLY because this is an in-memory mock database
   * with no backend. A real system must never store or compare plain-text
   * passwords — hash + salt server-side (bcrypt/argon2) and never keep the
   * plain value anywhere, including in client state. */
  password: string;
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
  /** The mock "database" — every registered account. Empty now (mock seed
   * users removed); see the note on initialState below for why this
   * slice is currently disconnected from real customer accounts. */
  users: RegisteredUser[];
  pendingRegistration: PendingRegistration | null;
  passwordResetEmail: string | null;
}

const initialState: UsersState = {
  // Mock demo users removed. NOTE: this slice is now disconnected from
  // real customer accounts entirely — real registration/login goes
  // through authSlice.ts + the real backend (services/authApi.ts). This
  // slice (and Admin > User Management, which reads from it) will need a
  // real GET /admin/users endpoint to show actual registered customers.
  users: [],
  pendingRegistration: null,
  passwordResetEmail: null,
};

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
