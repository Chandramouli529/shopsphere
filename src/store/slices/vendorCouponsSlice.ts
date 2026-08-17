import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type VendorCouponType = "percentage" | "flat" | "festival" | "bogo";

export interface VendorCoupon {
  id: string;
  vendorId: string;
  code: string;
  type: VendorCouponType;
  /** Percentage off (for "percentage") or flat rupee amount off (for
   * "flat"). Unused for "festival" (percentage under the hood) and "bogo". */
  value: number;
  festivalName?: string; // only for type "festival"
  minOrder: number;
  active: boolean;
  createdAt: number;
}

interface VendorCouponsState {
  coupons: VendorCoupon[];
}


const initialState: VendorCouponsState = {
  // Mock coupons removed — populate from a real backend once one exists.
  coupons: [],
};

const vendorCouponsSlice = createSlice({
  name: "vendorCoupons",
  initialState,
  reducers: {
    addVendorCoupon(state, action: PayloadAction<Omit<VendorCoupon, "id" | "createdAt">>) {
      state.coupons.push({ ...action.payload, id: "vc_" + Date.now(), createdAt: Date.now() });
    },
    deleteVendorCoupon(state, action: PayloadAction<string>) {
      state.coupons = state.coupons.filter((c) => c.id !== action.payload);
    },
    toggleVendorCouponActive(state, action: PayloadAction<string>) {
      const c = state.coupons.find((c) => c.id === action.payload);
      if (c) c.active = !c.active;
    },
  },
});

export const { addVendorCoupon, deleteVendorCoupon, toggleVendorCouponActive } = vendorCouponsSlice.actions;
export default vendorCouponsSlice.reducer;
