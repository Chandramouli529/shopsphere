import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  emoji: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  /** Set when the user taps "Add to Cart" while logged out. The login/OTP
   * flow reads this once the user authenticates, adds it to `items`, and
   * clears it — so the item they tried to add actually ends up in their cart
   * instead of silently disappearing. */
  pendingItem: CartItem | null;
  /** Currently applied coupon code, if any. Kept here (not local component
   * state) so it survives navigating from Cart to Checkout. */
  appliedCouponCode: string | null;
}

const initialState: CartState = {
  items: [],
  pendingItem: null,
  appliedCouponCode: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push(action.payload);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    incrementQty(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.qty += 1;
    },
    decrementQty(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.qty > 1) item.qty -= 1;
    },
    clearCart(state) {
      state.items = [];
      state.appliedCouponCode = null;
    },
    setPendingItem(state, action: PayloadAction<CartItem>) {
      state.pendingItem = action.payload;
    },
    clearPendingItem(state) {
      state.pendingItem = null;
    },
    applyCoupon(state, action: PayloadAction<string>) {
      state.appliedCouponCode = action.payload;
    },
    removeCoupon(state) {
      state.appliedCouponCode = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  incrementQty,
  decrementQty,
  clearCart,
  setPendingItem,
  clearPendingItem,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;
export default cartSlice.reducer;
