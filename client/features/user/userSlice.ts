import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  isAuthenticated: boolean
  email: string | null
  password: string | null
  wishlist: string[]
}

const initialState: UserState = {
  isAuthenticated: false,
  email: null, 
  password: null,
  wishlist: [],
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.isAuthenticated = true
      state.email = action.payload.email
      state.password = action.payload.password
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.email = null
      state.password = null
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