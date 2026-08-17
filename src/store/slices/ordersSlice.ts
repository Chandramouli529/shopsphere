import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Address } from "./settingsSlice";

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  emoji: string;
  image?: string;
}

export type OrderStatus = "placed" | "shipped" | "delivered";

export interface Order {
  id: string;
  items: OrderItem[];
  itemsTotal: number;
  deliveryCharge: number;
  couponCode?: string;
  couponDiscount?: number;
  grandTotal: number;
  address: Address;
  paymentMethod: string;
  placedAt: number;
  status: OrderStatus;
}

interface OrdersState {
  list: Order[];
}

const initialState: OrdersState = { list: [] };

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    placeOrder: {
      reducer(state, action: PayloadAction<Order>) {
        state.list.unshift(action.payload);
      },
      prepare(payload: Omit<Order, "id" | "placedAt" | "status">) {
        return {
          payload: {
            ...payload,
            id: "ORD" + Date.now().toString().slice(-8),
            placedAt: Date.now(),
            status: "placed" as OrderStatus,
          },
        };
      },
    },
  },
});

export const { placeOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
