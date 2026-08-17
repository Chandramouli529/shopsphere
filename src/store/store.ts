import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import settingsReducer from "./slices/settingsSlice";
import ordersReducer from "./slices/ordersSlice";
import wishlistReducer from "./slices/wishlistSlice";
import themeReducer from "./slices/themeSlice";
import usersReducer from "./slices/usersSlice";
import vendorAuthReducer from "./slices/vendorAuthSlice";
import adminAuthReducer from "./slices/adminAuthSlice";
import vendorProductsReducer from "./slices/vendorProductsSlice";
import vendorOrderStatusReducer from "./slices/vendorOrderStatusSlice";
import vendorCouponsReducer from "./slices/vendorCouponsSlice";
import vendorsReducer from "./slices/vendorsSlice";
import platformContentReducer from "./slices/platformContentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    settings: settingsReducer,
    orders: ordersReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
    users: usersReducer,
    vendorAuth: vendorAuthReducer,
    adminAuth: adminAuthReducer,
    vendorProducts: vendorProductsReducer,
    vendorOrderStatus: vendorOrderStatusReducer,
    vendorCoupons: vendorCouponsReducer,
    vendors: vendorsReducer,
    platformContent: platformContentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
