import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { secureStorage, type UserData } from '@/services/secureStorage';
import { authApi } from '@/services/authApi';
import type { RootState } from '@/store/store'; // make sure this type exists in store.ts

// ========== Types ==========

type User = UserData;

export type AuthStatus = 'idle' | 'loading' | 'verifying' | 'succeeded' | 'failed';

interface PendingRegistration {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
  pendingRegistration: PendingRegistration | null;
  /** Email currently going through the forgot-password OTP flow — kept
   * here since the new backend authApi doesn't return this on its own. */
  passwordResetEmail: string | null;
}

// ========== Initial State ==========

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  pendingRegistration: null,
  passwordResetEmail: null,
};

// ========== Thunks ==========

// 1) Register (step 1: create account, store pending registration)
export const registerStart = createAsyncThunk(
  'auth/registerStart',
  async (
    data: { firstName: string; lastName: string; email: string; mobileNumber: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.register(data);
      // The backend expects { name, email, password } and sends OTP to email.
      return {
        ...response,
        pendingRegistration: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNumber: data.mobileNumber,
          password: data.password,
        },
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Registration failed'
      );
    }
  }
);

// 2) Verify registration OTP (step 2: /auth/verify-email)
export const verifyRegistrationOtp = createAsyncThunk(
  'auth/verifyRegistrationOtp',
  async (otp: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const email = state.auth.pendingRegistration?.email;

      if (!email) {
        return rejectWithValue('No pending registration found');
      }

      const response = await authApi.verifyEmail(email, otp);

      // Save token + user together so a restored session doesn't need an
      // extra network round-trip just to know who's logged in.
      if (response.token && response.user) {
        await secureStorage.saveAuthState(response.token, response.user);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Invalid OTP'
      );
    }
  }
);

// 3) Login with password (/auth/login)
export const loginWithPassword = createAsyncThunk(
  'auth/loginWithPassword',
  async (
    data: { email: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.login(data);

      // Save token + user together, plus the remember-me preference.
      if (response.token && response.user) {
        await secureStorage.saveAuthState(response.token, response.user);
        if (data.rememberMe) {
          await secureStorage.saveRememberMe(true);
        }
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Login failed'
      );
    }
  }
);

// 4) Forgot password: send OTP to email (reusing verify-email endpoint)
export const forgotPasswordStart = createAsyncThunk(
  'auth/forgotPasswordStart',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await authApi.requestOtp(email);
      return { email, res };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to send OTP'
      );
    }
  }
);

// 4b) Reset password after forgot-password OTP verification.
// NOTE: calls authApi.resetPassword, whose endpoint path is a guess
// following the /auth/* pattern — confirm against the real backend route.
export const resetPasswordWithOtp = createAsyncThunk(
  'auth/resetPasswordWithOtp',
  async (
    { otp, newPassword }: { otp: string; newPassword: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const email = state.auth.passwordResetEmail;
      if (!email) {
        return rejectWithValue('Password reset session expired. Please start again.');
      }
      const res = await authApi.resetPassword({ email, otp, newPassword });
      return { email, res };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Could not reset password'
      );
    }
  }
);

// 4c) Change password for a logged-in user.
// NOTE: calls authApi.changePassword — same caveat as above, confirm the
// real endpoint shape against the backend.
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    data: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.changePassword(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Could not change password'
      );
    }
  }
);

// 5) Restore session (used in _layout.tsx)
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const { token, userData } = await secureStorage.getAuthState();
      if (!token) {
        return rejectWithValue('No stored token');
      }

      // Fast path: both token and user are cached locally, no network call
      // needed just to know who's logged in.
      if (userData) {
        return { token, user: userData };
      }

      // Fallback: a token exists but no cached user (e.g. an older session
      // saved before user data was cached) — fetch the profile instead.
      const profile = await authApi.getProfile();
      const user = profile.user || profile;
      await secureStorage.saveUserData(user);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to restore session'
      );
    }
  }
);

// ========== Slice ==========

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    cancelRegistration: (state) => {
      state.pendingRegistration = null;
      state.status = 'idle';
      state.error = null;
    },
    setPasswordResetEmail: (state, action: { payload: string | null }) => {
      state.passwordResetEmail = action.payload;
    },
    // Local-only for now — no profile-update endpoint was provided. Swap
    // this for a thunk calling a real PATCH /auth/profile once one exists.
    updateProfile: (state, action: { payload: { name: string; mobile?: string } }) => {
      if (state.user) {
        state.user.name = action.payload.name;
        state.user.mobile = action.payload.mobile;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.pendingRegistration = null;
      secureStorage.clearAllAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerStart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerStart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingRegistration = action.payload.pendingRegistration;
        state.error = null;
      })
      .addCase(registerStart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyRegistrationOtp.pending, (state) => {
        state.status = 'verifying';
        state.error = null;
      })
      .addCase(verifyRegistrationOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.pendingRegistration = null;
        state.error = null;
      })
      .addCase(verifyRegistrationOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Login
      .addCase(loginWithPassword.pending, (state) => {
        state.status = 'verifying';
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Forgot password (send OTP)
      .addCase(forgotPasswordStart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPasswordStart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.passwordResetEmail = action.payload.email;
      })
      .addCase(forgotPasswordStart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Reset password
      .addCase(resetPasswordWithOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPasswordWithOtp.fulfilled, (state) => {
        state.status = 'succeeded';
        state.passwordResetEmail = null;
      })
      .addCase(resetPasswordWithOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Restore session
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'idle'; // no session, not an error
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearError, cancelRegistration, setPasswordResetEmail, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;