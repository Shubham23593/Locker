import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartAPI } from "../services/api";

// ✅ Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📦 Fetching cart from API...');
      const { data } = await cartAPI.getCart();
      console.log('📦 Cart API response:', data);
      
      if (data.success) {
        console.log('✅ Cart items:', data.data?. items?. length || 0);
        return data.data;
      }
      
      return { items: [], totalQuantity: 0, totalPrice: 0 };
    } catch (error) {
      console.error('❌ Fetch cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// ✅ Add to Cart
export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (product, { rejectWithValue }) => {
    try {
      console.log('➕ Adding to cart:', product. name);
      const { data } = await cartAPI.addToCart({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        quantity: product.quantity || 1,
      });
      
      console.log('✅ Product added, cart updated:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

// ✅ Update Cart Item
export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating cart item:', productId, 'quantity:', quantity);
      const { data } = await cartAPI. updateCartItem(productId, quantity);
      console.log('✅ Cart item updated:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Update cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart"
      );
    }
  }
);

// ✅ Remove from Cart
export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      console.log('➖ Removing from cart:', productId);
      const { data } = await cartAPI.removeFromCart(productId);
      console. log('✅ Item removed, cart updated:', data.data);
      return { productId, cart: data.data };
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart"
      );
    }
  }
);

// ✅ Clear Cart
export const clearCartAsync = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🗑️ Clearing cart...');
      await cartAPI.clearCart();
      console.log('✅ Cart cleared');
      return [];
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);

const initialState = {
  products: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      console.log('🗑️ Clearing cart (local)');
      state.products = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload. items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state. totalPrice = action.payload.totalPrice || 0;
        console.log('✅ Cart state updated:', state. products.length, 'items');
      })
      .addCase(fetchCart. rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.products = [];
        state. totalQuantity = 0;
        state.totalPrice = 0;
        console.error('❌ Cart fetch failed:', action.payload);
      })

      // Add to Cart
      . addCase(addToCartAsync. pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state. loading = false;
        state. products = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        console.log('✅ Cart updated after add:', state.products.length, 'items');
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.products = action.payload.items || [];
        state.totalQuantity = action. payload.totalQuantity || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        console.log('✅ Cart updated after quantity change:', state.products.length, 'items');
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Remove from Cart
      . addCase(removeFromCartAsync. pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload. cart. items || [];
        state.totalQuantity = action.payload.cart.totalQuantity || 0;
        state.totalPrice = action.payload.cart.totalPrice || 0;
        console.log('✅ Cart updated after remove:', state.products.length, 'items');
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.loading = false;
        state.products = [];
        state.totalQuantity = 0;
        state.totalPrice = 0;
        console.log('✅ Cart cleared successfully');
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;