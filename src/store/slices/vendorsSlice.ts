import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { VendorAccount } from "@/data/vendors";
import { adminApi, type CreateVendorInput } from "@/services/adminApi";

interface VendorsState {
  vendors: VendorAccount[];
  fetchStatus: "idle" | "loading" | "failed";
  fetchError: string | null;
  createStatus: "idle" | "loading" | "failed";
  createError: string | null;
  /** Per-vendor id, tracks in-flight approve/reject/suspend/reactivate/
   * delete calls so each VendorCard can show its own loading state
   * without disabling the whole list. */
  actionStatus: Record<string, "loading" | undefined>;
  /** The most recent approve/reject/suspend/reactivate/delete failure, so
   * the screen can show what actually went wrong instead of the action
   * just silently appearing to do nothing. */
  lastActionError: string | null;
}

const initialState: VendorsState = {
  vendors: [],
  fetchStatus: "idle",
  fetchError: null,
  createStatus: "idle",
  createError: null,
  actionStatus: {},
  lastActionError: null,
};

/** The real backend's status field might not match our 4 exact lowercase
 * values (e.g. "Active", "APPROVED", "Pending Review") — normalize
 * common variants so STATUS_META lookups (in admin/vendors.tsx) never
 * come back undefined and crash the card. Anything unrecognized falls
 * back to "pending" rather than breaking. */
function normalizeStatus(raw: unknown): VendorAccount["status"] {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s.includes("approve") || s === "active" || s === "verified") return "approved";
  if (s.includes("reject") || s === "declined") return "rejected";
  if (s.includes("suspend") || s === "blocked" || s === "disabled") return "suspended";
  return "pending";
}

function mapVendor(raw: any): VendorAccount {
  // Fallback chain — the create-vendor backend response nests the real
  // id under `data.vendorId` rather than at the top level (confirmed via
  // a raw response dump), so that's checked too, on top of the more
  // typical top-level id field names.
  const rawId = raw._id || raw.id || raw.vendorId || raw.uid || raw.data?.vendorId || raw.data?._id || raw.data?.id;
  return {
    id: rawId ? String(rawId) : `unknown_${raw.email ?? Math.random()}`,
    businessName: raw.shopName || raw.businessName || "",
    ownerName: raw.ownerName || [raw.firstName, raw.lastName].filter(Boolean).join(" "),
    email: raw.email,
    status: normalizeStatus(raw.status),
    category: raw.businessType || raw.category || "",
    joinedAt: raw.joinedAt || raw.createdAt ? new Date(raw.joinedAt || raw.createdAt).getTime() : Date.now(),
    firstName: raw.firstName,
    lastName: raw.lastName,
    vendorName: raw.vendorName,
    mobileNumber: raw.mobileNumber,
    businessType: raw.businessType,
    shopName: raw.shopName,
  };
}

/** GET /vendor — lists every vendor from the real backend. */
export const fetchVendors = createAsyncThunk("vendors/fetchVendors", async (_, { rejectWithValue }) => {
  try {
    const response = await adminApi.getVendors();
    const list = response.vendors || response.data || response;
    return (Array.isArray(list) ? list : []).map(mapVendor);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || error?.message || "Could not load vendors"
    );
  }
});

/** Creates a vendor through the real backend — POST /vendor/create, sent
 * with the admin's Authorization header attached automatically by
 * adminApi's axios interceptor. The backend is expected to generate the
 * vendor's password (and eventually email it) — nothing password-related
 * is sent from or shown to the client here.
 *
 * `data.businessType` is a category label chosen from the same
 * CATEGORIES list used elsewhere in the app (see admin/vendors.tsx's
 * Business Type chip picker) — kept as a plain string here rather than a
 * literal union since CATEGORIES is a runtime array, not compile-time
 * constants. */
export const createVendorRemote = createAsyncThunk(
  "vendors/createVendor",
  async (data: CreateVendorInput, { rejectWithValue }) => {
    try {
      const response = await adminApi.createVendor(data);
      const vendor = response.vendor || response;
      return mapVendor({ ...vendor, ...data, status: vendor.status || "pending" });
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not create vendor"
      );
    }
  }
);

/** PATCH /vendor/:id — used for approve/reject/suspend/reactivate, all of
 * which are just a status change. */
/** Our internal status values are lowercase (used for STATUS_META lookups,
 * filtering, etc.), but the backend's GET /vendor response already showed
 * non-standard casing (e.g. "Active" instead of "active") — this strongly
 * suggests its schema expects Title Case on write too. Sending the wrong
 * case is the most likely reason PATCH /vendor/:id was failing with a
 * generic "Vendor update failed" with no further detail. */
const BACKEND_STATUS_VALUE: Record<VendorAccount["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const updateVendorStatus = createAsyncThunk(
  "vendors/updateStatus",
  async (
    { id, status }: { id: string; status: VendorAccount["status"] },
    { rejectWithValue }
  ) => {
    try {
      await adminApi.updateVendor(id, { status: BACKEND_STATUS_VALUE[status] });
      return { id, status };
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.message || "Could not update vendor";
      return rejectWithValue(statusCode ? `${backendMessage} (HTTP ${statusCode})` : backendMessage);
    }
  }
);

/** DELETE /vendor/:id */
export const deleteVendorRemote = createAsyncThunk(
  "vendors/deleteVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminApi.deleteVendor(id);
      return { id };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not delete vendor"
      );
    }
  }
);

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearCreateVendorError(state) {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.fetchStatus = "idle";
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = (action.payload as string) ?? "Could not load vendors";
      })

      .addCase(createVendorRemote.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createVendorRemote.fulfilled, (state, action) => {
        state.createStatus = "idle";
        state.vendors.unshift(action.payload);
      })
      .addCase(createVendorRemote.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = (action.payload as string) ?? "Could not create vendor";
      })

      .addCase(updateVendorStatus.pending, (state, action) => {
        state.actionStatus[action.meta.arg.id] = "loading";
        state.lastActionError = null;
      })
      .addCase(updateVendorStatus.fulfilled, (state, action) => {
        delete state.actionStatus[action.payload.id];
        const v = state.vendors.find((v) => v.id === action.payload.id);
        if (v) v.status = action.payload.status;
      })
      .addCase(updateVendorStatus.rejected, (state, action) => {
        delete state.actionStatus[action.meta.arg.id];
        state.lastActionError = (action.payload as string) ?? "Could not update vendor status.";
      })

      .addCase(deleteVendorRemote.pending, (state, action) => {
        state.actionStatus[action.meta.arg] = "loading";
      })
      .addCase(deleteVendorRemote.fulfilled, (state, action) => {
        delete state.actionStatus[action.payload.id];
        state.vendors = state.vendors.filter((v) => v.id !== action.payload.id);
      })
      .addCase(deleteVendorRemote.rejected, (state, action) => {
        delete state.actionStatus[action.meta.arg];
        state.lastActionError = (action.payload as string) ?? "Could not delete vendor.";
      });
  },
});

export const { clearCreateVendorError } = vendorsSlice.actions;
export default vendorsSlice.reducer;