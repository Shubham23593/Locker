import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { clearCart } from "./cartSlice";
import productReducer, { clearProducts } from "./productSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    product: productReducer,
  },
});

// ✅ Add logout handler to clear all Redux state
export const logoutAndClearStore = () => {
  store.dispatch(clearCart());
  store.dispatch(clearProducts());
};

export default store;