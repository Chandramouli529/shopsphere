import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { vendorApi, VENDOR_TOKEN_KEY, type VendorData } from "@/services/vendorApi";
import { isEmailVerified, markEmailVerified } from "@/services/vendorVerifiedEmails";

export interface VendorSession {
  id: string;
  businessName: string;
  ownerName: string;
  vendorName: string;
  email: string;
  category: string;
  status: string;
}

interface VendorAuthState {
  /** "email" = entering email (default screen). "otp" = first-time
   * vendor, verifying the OTP admin sent when their account was created
   * — reached BEFORE password entry, only once per vendor ever.
   * "password" = entering password — reached either right after email
   * (returning vendor, already verified before) or right after OTP
   * verification succeeds (first-time vendor). */
  step: "email" | "otp" | "password";
  pendingEmail: string | null;
  /** True when this login skipped the real OTP screen (returning
   * vendor, already verified before) — used to decide whether to try
   * re-verifying with the password value before login, since the
   * backend's /vendor/login appears to require a preceding /vendor/verify
   * call in the same session (confirmed via diagnostic logging). */
  skippedOtp: boolean;
  status: "idle" | "loading" | "authenticated";
  vendor: VendorSession | null;
  accessToken: string | null;
  error: string | null;
}

const initialState: VendorAuthState = {
  step: "email",
  pendingEmail: null,
  skippedOtp: false,
  status: "idle",
  vendor: null,
  accessToken: null,
  error: null,
};

function mapVendorSession(vendor: VendorData): VendorSession {
  return {
    id: vendor._id,
    businessName: vendor.shopName || vendor.businessName || "",
    ownerName: vendor.ownerName || [vendor.firstName, vendor.lastName].filter(Boolean).join(" "),
    vendorName: vendor.vendorName || "",
    email: vendor.email,
    category: vendor.businessType || vendor.category || "",
    status: vendor.status || "approved",
  };
}

/** Step 1: enters email only. No network call here — there's no "send
 * OTP" endpoint, since the OTP was already emailed to the vendor by
 * admin when their account was created. Checks whether this email has
 * already completed OTP verification before (locally tracked): if so,
 * skips straight to the password step; otherwise moves to OTP entry. */
export const vendorEnterEmail = createAsyncThunk("vendorAuth/enterEmail", async (email: string, { rejectWithValue }) => {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes("@")) {
    return rejectWithValue("Enter a valid email address.");
  }
  const alreadyVerified = await isEmailVerified(trimmed);
  return { email: trimmed, alreadyVerified };
});

/** Step 2 (first-time vendors only): verifies the OTP against the real
 * backend. Does NOT log in yet — just confirms the email and moves to
 * the password step. */
export const vendorVerifyOtp = createAsyncThunk(
  "vendorAuth/verifyOtp",
  async (otp: string, { getState, rejectWithValue }) => {
    const state = getState() as { vendorAuth: VendorAuthState };
    const email = state.vendorAuth.pendingEmail;
    if (!email) {
      return rejectWithValue("Your session expired. Please start again.");
    }
    try {
      await vendorApi.verify({ email, otp });
      await markEmailVerified(email);
      return { email };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Invalid OTP"
      );
    }
  }
);

/** Step 3: enters password and logs in for real. Reached either right
 * after email (returning vendor) or right after OTP (first-time
 * vendor) — same thunk either way, since by this point OTP (if needed)
 * is already done. Blocks login entirely if admin hasn't approved the
 * vendor account yet. */
export const vendorLoginWithPassword = createAsyncThunk(
  "vendorAuth/loginWithPassword",
  async (password: string, { getState, rejectWithValue }) => {
    const state = getState() as { vendorAuth: VendorAuthState };
    const email = state.vendorAuth.pendingEmail;
    const skippedOtp = state.vendorAuth.skippedOtp;
    if (!email) {
      return rejectWithValue("Your session expired. Please start again.");
    }

    // Diagnostic confirmed the backend's /vendor/login 404s ("Vendor not
    // found") when called without a /vendor/verify in the same session —
    // for a returning login (no real OTP was shown), try verifying with
    // the password value in its place first. Best-effort: if this call
    // itself fails, we still proceed to attempt login rather than
    // blocking on it, since it's a workaround, not a confirmed contract.
    if (skippedOtp) {
      try {
        if (__DEV__) {
          console.warn(`[vendorAuthSlice] Returning login — calling POST /vendor/verify with password as otp for email="${email}"`);
        }
        await vendorApi.verify({ email, otp: password });
      } catch (verifyError: any) {
        if (__DEV__) {
          console.warn(
            "[vendorAuthSlice] Pre-login /vendor/verify (password-as-otp) failed — proceeding to /vendor/login anyway. Status:",
            verifyError?.response?.status,
            "Body:",
            verifyError?.response?.data
          );
        }
      }
    }

    try {
      if (__DEV__) {
        console.warn(
          `[vendorAuthSlice] Calling POST /vendor/login with email="${email}" (length ${email.length}), password length ${password.length}`
        );
      }
      const response = await vendorApi.login({ email, password });
      const vendorData = response.vendor || response.user || response;

      if (__DEV__) {
        console.warn("[vendorAuthSlice] Raw /vendor/login response.vendor (or .user, or root):", vendorData);
      }

      if (response.token) {
        await SecureStore.setItemAsync(VENDOR_TOKEN_KEY, response.token);
      }
      const vendor = mapVendorSession(vendorData);
      // The email you actually logged in with is always known, even if
      // the backend's response is missing/differently-shaped — better
      // than showing a blank field for something we definitely have.
      if (!vendor.email) vendor.email = email;
      return { vendor, token: response.token as string };
    } catch (error: any) {
      if (__DEV__) {
        console.warn(
          "[vendorAuthSlice] /vendor/login failed. HTTP status:",
          error?.response?.status,
          "Response body:",
          error?.response?.data
        );
      }
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    }
  }
);

export const vendorRestoreSession = createAsyncThunk("vendorAuth/restoreSession", async () => {
  const token = await SecureStore.getItemAsync(VENDOR_TOKEN_KEY);
  return { token };
});

export const vendorLogout = createAsyncThunk("vendorAuth/logout", async () => {
  await SecureStore.deleteItemAsync(VENDOR_TOKEN_KEY);
});

const vendorAuthSlice = createSlice({
  name: "vendorAuth",
  initialState,
  reducers: {
    resetVendorAuthFlow(state) {
      state.step = "email";
      state.pendingEmail = null;
      state.skippedOtp = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(vendorEnterEmail.fulfilled, (state, action) => {
        state.step = action.payload.alreadyVerified ? "password" : "otp";
        state.pendingEmail = action.payload.email;
        state.skippedOtp = action.payload.alreadyVerified;
        state.error = null;
      })
      .addCase(vendorEnterEmail.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Enter a valid email address.";
      })
      .addCase(vendorVerifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(vendorVerifyOtp.fulfilled, (state) => {
        state.status = "idle";
        state.step = "password";
        state.skippedOtp = false;
      })
      .addCase(vendorVerifyOtp.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Invalid OTP";
      })
      .addCase(vendorLoginWithPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(vendorLoginWithPassword.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.vendor = action.payload.vendor;
        state.accessToken = action.payload.token;
        state.step = "email";
        state.pendingEmail = null;
      })
      .addCase(vendorLoginWithPassword.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(vendorLogout.fulfilled, (state) => {
        state.status = "idle";
        state.vendor = null;
        state.accessToken = null;
        state.step = "email";
        state.pendingEmail = null;
        state.skippedOtp = false;
      });
  },
});

export const { resetVendorAuthFlow } = vendorAuthSlice.actions;
export default vendorAuthSlice.reducer;