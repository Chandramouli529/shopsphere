import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SavedCard {
  id: string;
  holderName: string;
  last4: string;
  expiry: string; // MM/YY
}

interface SettingsState {
  language: string;
  addresses: Address[];
  cards: SavedCard[];
  notifications: Record<string, boolean>;
  /** Which saved address Home's location bar / product delivery estimates
   * should reflect as "current". Null until the user has at least one
   * address. */
  currentAddressId: string | null;
}

const initialState: SettingsState = {
  language: "English",
  addresses: [],
  cards: [],
  notifications: {
    orders: true,
    offers: true,
    recommendations: false,
    app: true,
  },
  currentAddressId: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    addAddress(state, action: PayloadAction<Omit<Address, "id">>) {
      const newAddress = { id: "addr_" + Date.now(), ...action.payload };
      state.addresses.push(newAddress);
      // A newly added address becomes the active delivery location — most
      // users add an address because they want to use it right away.
      state.currentAddressId = newAddress.id;
    },
    removeAddress(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      if (state.currentAddressId === action.payload) {
        state.currentAddressId = state.addresses[0]?.id ?? null;
      }
    },
    setCurrentAddress(state, action: PayloadAction<string>) {
      state.currentAddressId = action.payload;
    },
    addCard(state, action: PayloadAction<Omit<SavedCard, "id">>) {
      state.cards.push({ id: "card_" + Date.now(), ...action.payload });
    },
    removeCard(state, action: PayloadAction<string>) {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
    },
    setNotificationToggle(state, action: PayloadAction<{ key: string; value: boolean }>) {
      state.notifications[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  setLanguage,
  addAddress,
  removeAddress,
  setCurrentAddress,
  addCard,
  removeCard,
  setNotificationToggle,
} = settingsSlice.actions;
export default settingsSlice.reducer;
