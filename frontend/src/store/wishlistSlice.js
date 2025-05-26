import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Async thunks
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (product, { rejectWithValue }) => {
    try {
      const response = await api.post('/wishlist', { productId: product.id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  lastUpdated: null,
  totalItems: 0,
  isInitialized: false,
};

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
      state.totalItems = 0;
    },
    updateWishlistItem: (state, action) => {
      const { id, updates } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.items[itemIndex] = { ...state.items[itemIndex], ...updates };
        state.lastUpdated = new Date().toISOString();
      }
    },
    reorderWishlistItems: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.items.splice(sourceIndex, 1);
      state.items.splice(destinationIndex, 0, removed);
      state.lastUpdated = new Date().toISOString();
    },
    setWishlistError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.items.some(item => item.id === action.payload.id)) {
          state.items.push(action.payload);
          state.totalItems = state.items.length;
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalItems = state.items.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalItems = action.payload.length;
        state.lastUpdated = new Date().toISOString();
        state.isInitialized = true;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      });
  },
});

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectWishlistTotalItems = (state) => state.wishlist.totalItems;
export const selectWishlistLastUpdated = (state) => state.wishlist.lastUpdated;
export const selectWishlistIsInitialized = (state) => state.wishlist.isInitialized;
export const selectWishlistItemById = (state, id) => 
  state.wishlist.items.find(item => item.id === id);

// Actions
export const {
  clearWishlist,
  updateWishlistItem,
  reorderWishlistItems,
  setWishlistError,
  clearWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
