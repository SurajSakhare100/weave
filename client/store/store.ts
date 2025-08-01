import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
// Import slices here
// import userReducer from '../features/user/userSlice'
import cartReducer from '../features/cart/cartSlice'
import userReducer from '../features/user/userSlice'
import vendorReducer from '../features/vendor/vendorSlice'
import { adminApi } from '../services/adminApi'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'user'] // Only persist cart and user state
}

const rootReducer = combineReducers({
  // user: userReducer,
  user: userReducer,
  cart: cartReducer,
  vendor: vendorReducer,
  [adminApi.reducerPath]: adminApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create store with proper middleware configuration
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    });
    
    // Add RTK Query middleware
    return defaultMiddleware.concat(adminApi.middleware);
  },
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store 