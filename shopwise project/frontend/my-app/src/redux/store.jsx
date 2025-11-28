import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { clearCart } from "./cartSlice";
import productReducer, { clearProducts } from "./productSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    product: productReducer,
  },
});

// ✅ Logout handler to clear all Redux state
export const logoutAndClearStore = () => {
  console.log('🔴 Logging out - clearing Redux store');
  store.dispatch(clearCart());
  store.dispatch(clearProducts());
  console.log('✅ Redux store cleared');
};

export default store;