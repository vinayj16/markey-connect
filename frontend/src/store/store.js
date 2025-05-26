import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { api } from './services/api';
import wishlistReducer from './slices/wishlistSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import themeReducer from './slices/themeSlice';
import errorReducer from './slices/errorSlice';

// Configure persist options
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['wishlist', 'cart', 'auth', 'theme'], // Only persist these reducers
  blacklist: ['api', 'ui', 'error'], // Don't persist these reducers
};

// Combine all reducers
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
  auth: authReducer,
  ui: uiReducer,
  theme: themeReducer,
  error: errorReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: {
        ignoredPaths: ['api'],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
  enhancers: (defaultEnhancers) => [
    ...defaultEnhancers,
    // Add any additional enhancers here
  ],
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default store;
