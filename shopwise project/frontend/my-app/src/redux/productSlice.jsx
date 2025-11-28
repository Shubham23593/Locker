import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    searchTerm: "",
  },
  reducers: {
    setProducts(state, action) {
      state.products = action.payload;
      console.log('✅ Redux: Products set -', action.payload. length, 'products');
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      console.log('🔍 Redux: Search term set -', action.payload);
    },
    clearProducts(state) {
      state.products = [];
      state.searchTerm = "";
      console.log('🗑️ Redux: Products cleared');
    },
  },
});

export const { setProducts, setSearchTerm, clearProducts } = productSlice.actions;
export default productSlice.reducer;