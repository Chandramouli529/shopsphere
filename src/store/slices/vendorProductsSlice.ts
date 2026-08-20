import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  vendorProductApi,
  buildCreatePayload,
  buildUpdatePayload,
  hasRealCategoryApi,
  ALL_REAL_CATEGORY_KEYS,
} from "@/services/vendorProductApi";

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
  createStatus: "idle" | "loading" | "failed";
  createError: string | null;
  fetchStatus: "idle" | "loading" | "failed";
  fetchError: string | null;
  actionStatus: Record<string, "loading" | undefined>;
}

const initialState: VendorProductsState = {
  products: [],
  createStatus: "idle",
  createError: null,
  fetchStatus: "idle",
  fetchError: null,
  actionStatus: {},
};

/** Maps a real backend product record (whatever category it came from)
 * back into our generic VendorProduct shape for display. Field names
 * vary per category (see buildCreatePayload), so this checks the most
 * likely spots for each generic field. */
function mapRemoteProduct(raw: any, category: string): VendorProduct {
  const imageField = category === "electronics" ? "images" : category === "books" ? "coverImages" : "imageUrls";
  return {
    id: raw._id || raw.id || `unknown_${Date.now()}_${Math.random()}`,
    vendorId: raw.vendorId || "",
    title: raw.productName || raw.titleDescription || "",
    description: raw.productDescription || "",
    price: Number(raw.sellingPrice ?? raw.price ?? 0),
    category,
    stock: Number(raw.stock ?? 0),
    lowStockThreshold: Number(raw.lowStockLimit ?? 10),
    images: raw[imageField] || [],
    variants: [],
    available: (raw.status ?? raw.stockStatus) !== "Inactive",
    approvalStatus: "approved",
    createdAt: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
    attributes: raw,
  };
}

/** Creates a product through the real per-category backend endpoint
 * (e.g. POST /fashion/create, POST /electronics/create) — there's no
 * single shared "create product" endpoint, so which URL gets called
 * depends entirely on the product's category. */
export const createProductRemote = createAsyncThunk(
  "vendorProducts/create",
  async (
    input: Omit<VendorProduct, "id" | "createdAt" | "approvalStatus">,
    { rejectWithValue }
  ) => {
    if (!hasRealCategoryApi(input.category)) {
      return rejectWithValue(
        `No product API is set up yet for this category. Product creation for "${input.category}" isn't available yet.`
      );
    }
    try {
      const payload = buildCreatePayload(input);
      const response = await vendorProductApi.create(input.category, payload);
      const raw = response.product || response.data || response;
      const product = mapRemoteProduct(raw, input.category);
      // The backend response may not echo back everything we sent
      // (variants, vendorId) — fall back to what we already know locally.
      return {
        ...product,
        vendorId: product.vendorId || input.vendorId,
        variants: input.variants,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not create product"
      );
    }
  }
);

/** No single endpoint lists "this vendor's products" — each category has
 * its own GET list, unscoped by vendor. So this queries every real
 * category endpoint in parallel, merges the results, and filters down to
 * the current vendor's own products client-side. A category endpoint
 * that errors (e.g. temporarily down) is skipped rather than failing the
 * whole fetch. */
export const fetchAllVendorProducts = createAsyncThunk(
  "vendorProducts/fetchAll",
  async (vendorId: string) => {
    const results = await Promise.all(
      ALL_REAL_CATEGORY_KEYS.map(async (categoryKey) => {
        try {
          const response = await vendorProductApi.list(categoryKey);
          const list = response.products || response.data || response;
          return (Array.isArray(list) ? list : [])
            .map((raw: any) => mapRemoteProduct(raw, categoryKey))
            .filter((p: VendorProduct) => p.vendorId === vendorId);
        } catch {
          return [];
        }
      })
    );
    return results.flat();
  }
);

export const updateProductRemote = createAsyncThunk(
  "vendorProducts/update",
  async (input: VendorProduct, { rejectWithValue }) => {
    if (!hasRealCategoryApi(input.category)) {
      return rejectWithValue(`No product API is set up yet for this category ("${input.category}").`);
    }
    try {
      const payload = buildUpdatePayload(input);
      await vendorProductApi.update(input.category, input.id, payload);
      return input;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not update product"
      );
    }
  }
);

export const deleteProductRemote = createAsyncThunk(
  "vendorProducts/delete",
  async ({ id, category }: { id: string; category: string }, { rejectWithValue }) => {
    if (!hasRealCategoryApi(category)) {
      return rejectWithValue(`No product API is set up yet for this category ("${category}").`);
    }
    try {
      await vendorProductApi.remove(category, id);
      return { id };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Could not delete product"
      );
    }
  }
);

const vendorProductsSlice = createSlice({
  name: "vendorProducts",
  initialState,
  reducers: {
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
    clearCreateError(state) {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductRemote.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createProductRemote.fulfilled, (state, action) => {
        state.createStatus = "idle";
        state.products.unshift(action.payload);
      })
      .addCase(createProductRemote.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = (action.payload as string) ?? "Could not create product";
      })

      .addCase(fetchAllVendorProducts.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchAllVendorProducts.fulfilled, (state, action) => {
        state.fetchStatus = "idle";
        state.products = action.payload;
      })
      .addCase(fetchAllVendorProducts.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.error.message ?? "Could not load products";
      })

      .addCase(updateProductRemote.pending, (state, action) => {
        state.actionStatus[action.meta.arg.id] = "loading";
      })
      .addCase(updateProductRemote.fulfilled, (state, action) => {
        delete state.actionStatus[action.payload.id];
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(updateProductRemote.rejected, (state, action) => {
        delete state.actionStatus[action.meta.arg.id];
      })

      .addCase(deleteProductRemote.pending, (state, action) => {
        state.actionStatus[action.meta.arg.id] = "loading";
      })
      .addCase(deleteProductRemote.fulfilled, (state, action) => {
        delete state.actionStatus[action.payload.id];
        state.products = state.products.filter((p) => p.id !== action.payload.id);
      })
      .addCase(deleteProductRemote.rejected, (state, action) => {
        delete state.actionStatus[action.meta.arg.id];
      });
  },
});

export const {
  setStock,
  toggleAvailability,
  approveProduct,
  rejectProduct,
  clearCreateError,
} = vendorProductsSlice.actions;
export default vendorProductsSlice.reducer;