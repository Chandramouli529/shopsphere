import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { safeSetItem, safeGetItem, safeDeleteItem } from "@/services/secureStorage";
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
  status: "idle" | "loading" | "authenticated";
  vendor: VendorSession | null;
  accessToken: string | null;
  error: string | null;
}

const initialState: VendorAuthState = {
  step: "email",
  pendingEmail: null,
  status: "idle",
  vendor: null,
  accessToken: null,
  error: null,
};

// Confirmed via a real raw-response dump: /vendor/login returns
// { data: { businessType, email, shopName, status, vendorId,
// vendorName, ... }, message, success, token } — the vendor's actual
// fields live under `data`, not at the top level and not under `.vendor`
// or `.user`. This mapper checks all of those, in that priority order,
// so it keeps working if the shape ever changes back.
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
 * is already done. Just one call to POST /vendor/login — confirmed via
 * real testing that no preceding /vendor/verify call is needed for a
 * returning vendor. */
export const vendorLoginWithPassword = createAsyncThunk(
  "vendorAuth/loginWithPassword",
  async (password: string, { getState, rejectWithValue }) => {
    const state = getState() as { vendorAuth: VendorAuthState };
    const email = state.vendorAuth.pendingEmail;
    if (!email) {
      return rejectWithValue("Your session expired. Please start again.");
    }

    try {
      const response = await vendorApi.login({ email, password });
      const vendorData: VendorData = response.vendor || response.user || response.data || response;

      if (response.token) {
        await safeSetItem(VENDOR_TOKEN_KEY, response.token);
      }
      const vendor = mapVendorSession(vendorData);
      // The email you actually logged in with is always known, even if
      // the backend's response is missing/differently-shaped — better
      // than showing a blank field for something we definitely have.
      if (!vendor.email) vendor.email = email;
      return { vendor, token: response.token as string };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    }
  }
);

export const vendorRestoreSession = createAsyncThunk("vendorAuth/restoreSession", async () => {
  const token = await safeGetItem(VENDOR_TOKEN_KEY);
  return { token };
});

export const vendorLogout = createAsyncThunk("vendorAuth/logout", async () => {
  await safeDeleteItem(VENDOR_TOKEN_KEY);
});

const vendorAuthSlice = createSlice({
  name: "vendorAuth",
  initialState,
  reducers: {
    resetVendorAuthFlow(state) {
      state.step = "email";
      state.pendingEmail = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(vendorEnterEmail.fulfilled, (state, action) => {
        state.step = action.payload.alreadyVerified ? "password" : "otp";
        state.pendingEmail = action.payload.email;
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
      });
  },
});

export const { resetVendorAuthFlow } = vendorAuthSlice.actions;
export default vendorAuthSlice.reducer;