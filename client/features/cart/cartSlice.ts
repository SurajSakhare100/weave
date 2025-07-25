import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartAPI } from '@/services/cartService'

interface CartItem {
  proId: string
  quantity: number
  price: number
  mrp: number
  variantSize?: string
  item: {
    _id: string
    name: string
    images?: {
      url: string
    }[]
    color?: string
    size?: string
  }
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const data = await getCart()
    // The server returns { result: [], amount: {} }
    return data.result || []
  } catch (err: any) {
    return rejectWithValue('Could not load cart')
  }
})

export const addCartItem = createAsyncThunk('cart/addCartItem', async ({ product, quantity, variantSize }: { product: any, quantity: number, variantSize?: string }, { rejectWithValue }) => {
  try {
    const result = await addToCart(product, quantity, variantSize)
    
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not add to cart')
    }
    
    const data = await getCart()
    
    if (data.success === false) {
      return rejectWithValue(data.message || 'Could not load cart')
    }
    
    return data.result || []
  } catch (err: any) {
    return rejectWithValue('Could not add to cart')
  }
})

export const updateCartQuantity = createAsyncThunk('cart/updateCartQuantity', async ({ proId, quantity }: { proId: string, quantity: number }, { rejectWithValue }) => {
  try {
    const result = await updateCartItem(proId, quantity)
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not update cart')
    }
    // Always refetch cart after update
    const data = await getCart()
    if (data.success === false) {
      return rejectWithValue(data.message || 'Could not load cart')
    }
    return data.result || []
  } catch (err: any) {
    return rejectWithValue('Could not update cart')
  }
})

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (proId: string, { rejectWithValue }) => {
  try {
    const result = await removeFromCart(proId)
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not remove from cart')
    }
    
    const data = await getCart()
    if (data.success === false) {
      return rejectWithValue(data.message || 'Could not load cart')
    }
    
    return data.result || []
  } catch (err: any) {
    return rejectWithValue('Could not remove from cart')
  }
})

export const clearCartAsync = createAsyncThunk('cart/clearCartAsync', async (_, { rejectWithValue }) => {
  try {
    const result = await clearCartAPI()
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not clear cart')
    }
    const data = await getCart()
    if (data.success === false) {
      return rejectWithValue(data.message || 'Could not load cart')
    }
    return data.result || []
  } catch (err: any) {
    return rejectWithValue('Could not clear cart')
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
  }
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer 