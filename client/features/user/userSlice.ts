import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  isAuthenticated: boolean
  email: string | null
  user: {
    _id?: string
    firstName?: string
    lastName?: string
    email?: string
    avatar?: string
  } | null
  wishlist: string[]
}

const initialState: UserState = {
  isAuthenticated: false,
  email: null,
  user: null,
  wishlist: [],
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; user?: any }>) => {
      state.isAuthenticated = true
      state.email = action.payload.email
      state.user = action.payload.user || null
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.email = null
      state.user = null
      state.wishlist = []
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload }
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

export const { login, logout, updateUser, addToWishlist, removeFromWishlist } = userSlice.actions
export default userSlice.reducer 