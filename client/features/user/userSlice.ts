import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  isAuthenticated: boolean
  name: string | null
  role: 'user' | 'vendor' | null
  wishlist: string[]
}

const initialState: UserState = {
  isAuthenticated: false,
  name: null,
  role: null,
  wishlist: [],
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ name: string; role: 'user' | 'vendor' }>) => {
      state.isAuthenticated = true
      state.name = action.payload.name
      state.role = action.payload.role
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.name = null
      state.role = null
      state.wishlist = []
    },
    addToWishlist: (state, action: PayloadAction<string>) => {
      if (!state.wishlist.includes(action.payload)) {
        state.wishlist.push(action.payload)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(id => id !== action.payload)
    },
  },
})

export const { login, logout, addToWishlist, removeFromWishlist } = userSlice.actions
export default userSlice.reducer 