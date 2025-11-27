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
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    // ✅ Add clearProducts action
    clearProducts: (state) => {
      state.products = [];
      state.searchTerm = "";
    },
  },
});

export const { setProducts, setSearchTerm, clearProducts } = productSlice.actions;
export default productSlice.reducer;