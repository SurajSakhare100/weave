import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
// Import slices here
// import userReducer from '../features/user/userSlice'
import cartReducer from '../features/cart/cartSlice'
import userReducer from '../features/user/userSlice'
import vendorReducer from '../features/vendor/vendorSlice'

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
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store 