import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  emoji: string;
  image?: string;
}

interface WishlistState {
  items: WishlistItem[];
  /** Set when the user taps "Add to Wishlist" while logged out — picked up
   * by the OTP screen once login succeeds, same pattern as cart.pendingItem. */
  pendingItem: WishlistItem | null;
}

const initialState: WishlistState = {
  items: [],
  pendingItem: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addWishlistItem(state, action: PayloadAction<WishlistItem>) {
      if (!state.items.some((i) => i.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    removeWishlistItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setPendingWishlistItem(state, action: PayloadAction<WishlistItem>) {
      state.pendingItem = action.payload;
    },
    clearPendingWishlistItem(state) {
      state.pendingItem = null;
    },
  },
});

export const {
  addWishlistItem,
  removeWishlistItem,
  setPendingWishlistItem,
  clearPendingWishlistItem,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
