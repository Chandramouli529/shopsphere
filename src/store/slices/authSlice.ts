import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  secureStorage,
  type UserData,
} from "@/services/secureStorage";
import { authApi } from "@/services/authApi";
import type { RootState } from "@/store/store";

// ======================================================
// TYPES
// ======================================================

type User = UserData;

export type AuthStatus =
  | "idle"
  | "loading"
  | "verifying"
  | "succeeded"
  | "failed";

interface PendingRegistration {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
  pendingRegistration: PendingRegistration | null;
  passwordResetEmail: string | null;
}

// ======================================================
// INITIAL STATE
// ======================================================

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
  pendingRegistration: null,
  passwordResetEmail: null,
};

// ======================================================
// USER NORMALIZATION
// ======================================================

// Applied everywhere a user object first enters the app (login, verify,
// restore session) — the real backend returns firstName/lastName
// separately (no combined "name"), sometimes omits email from a
// response entirely, and calls the phone field "mobileNumber" instead
// of "mobile". Centralizing this fix here means every entry point gets
// it, including restored sessions from data cached before this fix
// existed — a stale cached user object missing .name would otherwise
// keep crashing account.tsx forever, since restoreSession's fast path
// returns cached data as-is without this correction.
function normalizeUser(user: any, fallbackEmail?: string): any {
  if (!user) return user;
  if (!user.name) {
    user.name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || fallbackEmail || "Customer";
  }
  if (!user.email && fallbackEmail) {
    user.email = fallbackEmail;
  }
  if (!user.mobile && user.mobileNumber) {
    user.mobile = user.mobileNumber;
  }
  return user;
}

// ======================================================
// REGISTER
// ======================================================

export const registerStart = createAsyncThunk(
  "auth/registerStart",
  async (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("REGISTER DATA FROM SCREEN:", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        passwordLength: data.password.length,
        confirmPasswordLength: data.confirmPassword.length,
      });

      const response = await authApi.register(data);

      return {
        ...response,

        pendingRegistration: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNumber: data.mobileNumber,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      };
    } catch (error: any) {
      console.error(
        "REGISTER API ERROR:",
        error?.response?.data || error
      );

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed"
      );
    }
  }
);

// ======================================================
// VERIFY REGISTRATION OTP
// ======================================================

export const verifyRegistrationOtp = createAsyncThunk(
  "auth/verifyRegistrationOtp",
  async (
    otp: string,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;

      const email =
        state.auth.pendingRegistration?.email;

      if (!email) {
        return rejectWithValue(
          "No pending registration found"
        );
      }

      const response =
        await authApi.verifyEmail(email, otp);

      if (__DEV__) {
        console.warn(
          "[authSlice] Raw /auth/verify-email response:",
          response
        );
      }

      // Same fallback chain as loginWithPassword — the user object isn't
      // always at response.user for this backend.
      const user =
        response.user ||
        response.customer ||
        response.data?.user ||
        response.data;
      const token =
        response.token ||
        response.data?.token ||
        response.accessToken;

      // The backend returns firstName/lastName separately (no combined
      // name), sometimes omits email, and calls the phone field
      // mobileNumber — normalizeUser fixes all of that in one place.
      normalizeUser(user, email);

      if (token && user) {
        await secureStorage.saveAuthState(
          token,
          user
        );
      }

      return { ...response, user, token };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid OTP"
      );
    }
  }
);

// ======================================================
// LOGIN
// ======================================================

export const loginWithPassword = createAsyncThunk(
  "auth/loginWithPassword",
  async (
    data: {
      email: string;
      password: string;
      rememberMe?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await authApi.login(data);

      if (__DEV__) {
        console.warn(
          "[authSlice] Raw /auth/login response:",
          response
        );
      }

      // The user object isn't always at response.user — some backends
      // nest it under response.data.user, response.customer, or return
      // it flat at the top level of response.data alongside token/message.
      const user =
        response.user ||
        response.customer ||
        response.data?.user ||
        response.data;
      const token =
        response.token ||
        response.data?.token ||
        response.accessToken;

      if (token && user) {
        await secureStorage.saveAuthState(
          token,
          user
        );

        if (data.rememberMe) {
          await secureStorage.saveRememberMe(true);
        }
      } else if (__DEV__) {
        console.warn(
          "[authSlice] Login succeeded but token/user could not be extracted from the response — check the raw response logged above."
        );
      }

      // The email you actually logged in with is always known, even if
      // the backend's user object is missing it or names it differently —
      // better than showing a blank/"undefined" email for something we
      // definitely have.
      if (__DEV__ && user && !user.email) {
        console.warn(
          "[authSlice] Login response's user object has no .email field — falling back to the email typed into the login form. Raw user object:",
          user
        );
      }
      normalizeUser(user, data.email);

      return { ...response, user, token };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed"
      );
    }
  }
);

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPasswordStart = createAsyncThunk(
  "auth/forgotPasswordStart",
  async (
    email: string,
    { rejectWithValue }
  ) => {
    try {
      const res =
        await authApi.requestOtp(email);

      return {
        email,
        res,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send OTP"
      );
    }
  }
);

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPasswordWithOtp =
  createAsyncThunk(
    "auth/resetPasswordWithOtp",
    async (
      {
        otp,
        newPassword,
      }: {
        otp: string;
        newPassword: string;
      },
      { getState, rejectWithValue }
    ) => {
      try {
        const state = getState() as RootState;

        const email =
          state.auth.passwordResetEmail;

        if (!email) {
          return rejectWithValue(
            "Password reset session expired. Please start again."
          );
        }

        const res =
          await authApi.resetPassword({
            email,
            otp,
            newPassword,
          });

        return {
          email,
          res,
        };
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            error?.message ||
            "Could not reset password"
        );
      }
    }
  );

// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    data: {
      currentPassword: string;
      newPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res =
        await authApi.changePassword(data);

      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Could not change password"
      );
    }
  }
);

// ======================================================
// RESTORE SESSION
// ======================================================

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const {
        token,
        userData,
      } = await secureStorage.getAuthState();

      if (!token) {
        return rejectWithValue(
          "No stored token"
        );
      }

      if (userData) {
        // Cached user data may have been saved before normalizeUser
        // existed (e.g. from an earlier login), so it can still be
        // missing .name even though today's login/verify thunks always
        // produce a correct one. Re-normalize on every restore, and
        // persist the fix so this only ever needs to happen once per
        // device.
        const normalized = normalizeUser(userData);
        if (normalized.name !== userData.name || normalized.mobile !== userData.mobile) {
          await secureStorage.saveUserData(normalized);
        }
        return {
          token,
          user: normalized,
        };
      }

      const profile =
        await authApi.getProfile();

      const user =
        normalizeUser(profile.user || profile);

      await secureStorage.saveUserData(user);

      return {
        token,
        user,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to restore session"
      );
    }
  }
);

// ======================================================
// SLICE
// ======================================================

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    cancelRegistration: (state) => {
      state.pendingRegistration = null;
      state.status = "idle";
      state.error = null;
    },

    setPasswordResetEmail: (
      state,
      action: {
        payload: string | null;
      }
    ) => {
      state.passwordResetEmail =
        action.payload;
    },

    updateProfile: (
      state,
      action: {
        payload: {
          name: string;
          mobile?: string;
        };
      }
    ) => {
      if (state.user) {
        state.user.name =
          action.payload.name;

        state.user.mobile =
          action.payload.mobile;
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      state.pendingRegistration = null;

      secureStorage.clearAllAuth();
    },
  },

  extraReducers: (builder) => {
    builder

      // ==================================================
      // REGISTER
      // ==================================================

      .addCase(
        registerStart.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        registerStart.fulfilled,
        (state, action) => {
          state.status = "succeeded";

          state.pendingRegistration =
            action.payload.pendingRegistration;

          state.error = null;
        }
      )

      .addCase(
        registerStart.rejected,
        (state, action) => {
          state.status = "failed";

          state.error =
            action.payload as string;
        }
      )

      // ==================================================
      // VERIFY OTP
      // ==================================================

      .addCase(
        verifyRegistrationOtp.pending,
        (state) => {
          state.status = "verifying";
          state.error = null;
        }
      )

      .addCase(
        verifyRegistrationOtp.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.user =
            action.payload.user;
          state.token =
            action.payload.token;
          state.pendingRegistration = null;
          state.error = null;
        }
      )

      .addCase(
        verifyRegistrationOtp.rejected,
        (state, action) => {
          state.status = "failed";
          state.error =
            action.payload as string;
        }
      )

      // ==================================================
      // LOGIN
      // ==================================================

      .addCase(
        loginWithPassword.pending,
        (state) => {
          state.status = "verifying";
          state.error = null;
        }
      )

      .addCase(
        loginWithPassword.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.user =
            action.payload.user;
          state.token =
            action.payload.token;
          state.error = null;
        }
      )

      .addCase(
        loginWithPassword.rejected,
        (state, action) => {
          state.status = "failed";
          state.error =
            action.payload as string;
        }
      )

      // ==================================================
      // FORGOT PASSWORD
      // ==================================================

      .addCase(
        forgotPasswordStart.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        forgotPasswordStart.fulfilled,
        (state, action) => {
          state.status = "succeeded";

          state.passwordResetEmail =
            action.payload.email;
        }
      )

      .addCase(
        forgotPasswordStart.rejected,
        (state, action) => {
          state.status = "failed";

          state.error =
            action.payload as string;
        }
      )

      // ==================================================
      // RESET PASSWORD
      // ==================================================

      .addCase(
        resetPasswordWithOtp.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        resetPasswordWithOtp.fulfilled,
        (state) => {
          state.status = "succeeded";
          state.passwordResetEmail = null;
        }
      )

      .addCase(
        resetPasswordWithOtp.rejected,
        (state, action) => {
          state.status = "failed";

          state.error =
            action.payload as string;
        }
      )

      // ==================================================
      // CHANGE PASSWORD
      // ==================================================

      .addCase(
        changePassword.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        changePassword.fulfilled,
        (state) => {
          state.status = "succeeded";
        }
      )

      .addCase(
        changePassword.rejected,
        (state, action) => {
          state.status = "failed";

          state.error =
            action.payload as string;
        }
      )

      // ==================================================
      // RESTORE SESSION
      // ==================================================

      .addCase(
        restoreSession.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        restoreSession.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.user =
            action.payload.user;
          state.token =
            action.payload.token;
          state.error = null;
        }
      )

      .addCase(
        restoreSession.rejected,
        (state) => {
          state.status = "idle";
          state.user = null;
          state.token = null;
          state.error = null;
        }
      );
  },
});

export const {
  clearError,
  cancelRegistration,
  setPasswordResetEmail,
  updateProfile,
  logout,
} = authSlice.actions;

export default authSlice.reducer;