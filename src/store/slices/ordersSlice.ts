import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Address } from "./settingsSlice";
import { orderApi, type CreateOrderInput } from "@/services/orderApi";

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  emoji: string;
  image?: string;
}

export type OrderStatus = "placed" | "shipped" | "delivered" | "cancelled";

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
  createStatus: "idle" | "loading" | "failed";
  createError: string | null;
  fetchStatus: "idle" | "loading" | "failed";
  fetchError: string | null;
  actionStatus: Record<string, "loading" | undefined>;
}

const initialState: OrdersState = {
  list: [],
  createStatus: "idle",
  createError: null,
  fetchStatus: "idle",
  fetchError: null,
  actionStatus: {},
};

const COUNTRY = "India";

/** Maps a real backend order record back into our display shape. Field
 * names are a best guess for the response (order create/list schema
 * wasn't given, only the create request body) — this is defensive by
 * design, trying several likely locations for each field. */
function mapRemoteOrder(raw: any): Order {
  const rawItems = raw.items || [];
  return {
    id: raw._id || raw.id || raw.orderId || `unknown_${Date.now()}`,
    items: rawItems.map((it: any) => ({
      id: it.productId || it.id || "",
      title: it.title || it.productName || "",
      price: Number(it.price ?? 0),
      qty: Number(it.quantity ?? it.qty ?? 1),
      emoji: "📦",
      image: it.image,
    })),
    itemsTotal: Number(raw.itemsTotal ?? raw.subtotal ?? 0),
    deliveryCharge: Number(raw.deliveryCharge ?? raw.shippingCharge ?? 0),
    couponCode: raw.couponCode,
    couponDiscount: raw.couponDiscount,
    grandTotal: Number(raw.grandTotal ?? raw.total ?? raw.totalAmount ?? 0),
    address: {
      id: "remote",
      name: raw.name || "",
      phone: raw.phone || "",
      line1: raw.deliveryAddress || raw.address || "",
      city: raw.city || "",
      state: raw.state || "",
      pincode: raw.postalCode || raw.pincode || "",
    },
    paymentMethod: raw.paymentMethod || "",
    placedAt: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
    status: (raw.status || "placed").toLowerCase(),
  };
}

/** Real order creation — POST /orders/create. The backend's fields are
 * flat (deliveryAddress/city/state/postalCode/country as separate top-
 * level fields), not one nested address object like our local Address
 * type — this thunk does that translation. */
export const createOrderRemote = createAsyncThunk(
  "orders/create",
  async (
    input: {
      items: OrderItem[];
      itemsTotal: number;
      couponCode?: string;
      couponDiscount?: number;
      deliveryCharge: number;
      grandTotal: number;
      address: Address;
      paymentMethod: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: CreateOrderInput = {
        items: input.items.map((i) => ({
          productId: i.id,
          title: i.title,
          price: i.price,
          quantity: i.qty,
        })),
        paymentMethod: input.paymentMethod,
        deliveryAddress: input.address.line1,
        city: input.address.city,
        state: input.address.state,
        postalCode: input.address.pincode,
        country: COUNTRY,
      };
      const response = await orderApi.create(payload);
      const raw = response.order || response.data || response;
      const order = mapRemoteOrder(raw);
      // The backend may not echo back everything we sent (coupon,
      // delivery charge breakdown) — fall back to what we already know
      // locally for display purposes.
      return {
        ...order,
        items: order.items.length ? order.items : input.items,
        itemsTotal: order.itemsTotal || input.itemsTotal,
        deliveryCharge: order.deliveryCharge || input.deliveryCharge,
        grandTotal: order.grandTotal || input.grandTotal,
        couponCode: input.couponCode,
        couponDiscount: input.couponDiscount,
        address: order.address.line1 ? order.address : input.address,
        paymentMethod: order.paymentMethod || input.paymentMethod,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not place order"
      );
    }
  }
);

export const fetchOrders = createAsyncThunk("orders/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await orderApi.list();
    const list = response.orders || response.data || response;
    return (Array.isArray(list) ? list : []).map(mapRemoteOrder);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || error?.message || "Could not load orders"
    );
  }
});

export const cancelOrderRemote = createAsyncThunk(
  "orders/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      await orderApi.cancel(id);
      return { id };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not cancel order"
      );
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCreateOrderError(state) {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderRemote.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createOrderRemote.fulfilled, (state, action) => {
        state.createStatus = "idle";
        state.list.unshift(action.payload);
      })
      .addCase(createOrderRemote.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = (action.payload as string) ?? "Could not place order";
      })

      .addCase(fetchOrders.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.fetchStatus = "idle";
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = (action.payload as string) ?? "Could not load orders";
      })

      .addCase(cancelOrderRemote.pending, (state, action) => {
        state.actionStatus[action.meta.arg] = "loading";
      })
      .addCase(cancelOrderRemote.fulfilled, (state, action) => {
        delete state.actionStatus[action.payload.id];
        const order = state.list.find((o) => o.id === action.payload.id);
        if (order) order.status = "cancelled";
      })
      .addCase(cancelOrderRemote.rejected, (state, action) => {
        delete state.actionStatus[action.meta.arg];
      });
  },
});

export const { clearCreateOrderError } = ordersSlice.actions;
export default ordersSlice.reducer;