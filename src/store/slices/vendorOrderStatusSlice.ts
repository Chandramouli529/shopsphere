import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type VendorOrderStatus = "pending" | "accepted" | "rejected" | "packed" | "shipped" | "delivered";

interface VendorOrderStatusState {
  /** orderId -> vendor fulfillment status. Absence from this map means
   * "pending" (not yet acted on). */
  statusByOrderId: Record<string, VendorOrderStatus>;
}

const initialState: VendorOrderStatusState = {
  statusByOrderId: {},
};

export const ORDER_STATUS_SEQUENCE: VendorOrderStatus[] = [
  "pending",
  "accepted",
  "packed",
  "shipped",
  "delivered",
];

const vendorOrderStatusSlice = createSlice({
  name: "vendorOrderStatus",
  initialState,
  reducers: {
    setVendorOrderStatus(state, action: PayloadAction<{ orderId: string; status: VendorOrderStatus }>) {
      state.statusByOrderId[action.payload.orderId] = action.payload.status;
    },
  },
});

export const { setVendorOrderStatus } = vendorOrderStatusSlice.actions;
export default vendorOrderStatusSlice.reducer;
