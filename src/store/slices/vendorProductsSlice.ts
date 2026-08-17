import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  variants: ProductVariant[];
  available: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: number;
  /** Category-specific extra fields (see data/vendorProductAttributes.ts)
   * — e.g. for Fashion: brandName, material, fitType, sizes, colors,
   * mrp, etc. Keyed by attribute field key, all stored as strings (even
   * "number" type fields) since that's what a TextInput naturally gives;
   * parse to number where the backend expects one. Empty object for
   * categories with no defined attribute schema yet. */
  attributes: Record<string, string>;
}

interface VendorProductsState {
  products: VendorProduct[];
}

function seedProducts(): VendorProduct[] {
  // Mock vendor products removed — populate from a real backend once one exists.
  return [];
}

const initialState: VendorProductsState = {
  products: seedProducts(),
};

const vendorProductsSlice = createSlice({
  name: "vendorProducts",
  initialState,
  reducers: {
    addProduct: {
      reducer(state, action: PayloadAction<VendorProduct>) {
        state.products.unshift(action.payload);
      },
      prepare(input: Omit<VendorProduct, "id" | "createdAt" | "approvalStatus">) {
        return {
          payload: {
            ...input,
            id: "vp_" + Date.now(),
            approvalStatus: "pending" as const,
            createdAt: Date.now(),
          },
        };
      },
    },
    updateProduct(state, action: PayloadAction<VendorProduct>) {
      const idx = state.products.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.products[idx] = action.payload;
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setStock(state, action: PayloadAction<{ id: string; stock: number }>) {
      const product = state.products.find((p) => p.id === action.payload.id);
      if (product) product.stock = Math.max(0, action.payload.stock);
    },
    toggleAvailability(state, action: PayloadAction<string>) {
      const product = state.products.find((p) => p.id === action.payload);
      if (product) product.available = !product.available;
    },
    approveProduct(state, action: PayloadAction<string>) {
      const product = state.products.find((p) => p.id === action.payload);
      if (product) product.approvalStatus = "approved";
    },
    rejectProduct(state, action: PayloadAction<string>) {
      const product = state.products.find((p) => p.id === action.payload);
      if (product) product.approvalStatus = "rejected";
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  setStock,
  toggleAvailability,
  approveProduct,
  rejectProduct,
} = vendorProductsSlice.actions;
export default vendorProductsSlice.reducer;