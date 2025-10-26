import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartAPI } from '@/services/cartService'
import { CartItemType, CartState } from '@/types'


const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}
const isValidCartItem = (item: any): item is CartItemType => {
  return (
    item &&
    typeof item.proId === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.price === 'number' &&
    typeof item.mrp === 'number' &&
    item.item &&
    typeof item.item._id === 'string' &&
    typeof item.item.name === 'string'
  )
}

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const data = await getCart()
    
    if (data.success === false) {
      return rejectWithValue(data.message || 'Could not load cart')
    }
    
    const result = data.result || []
    return result
  } catch (err: any) {
    return rejectWithValue(err.message || 'Could not load cart')
  }
})

export const addCartItem = createAsyncThunk('cart/addCartItem', async ({ product, quantity, variantSize }: { product: any, quantity: number, variantSize?: string }, { rejectWithValue }) => {
  try {
    if (!product || !product._id) {
      return rejectWithValue('Invalid product data')
    }

    const result = await addToCart(product, quantity, variantSize)
    
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not add to cart')
    }
    
    return result.result || []
  } catch (err: any) {
    return rejectWithValue(err.message || 'Could not add to cart')
  }
})

export const updateCartQuantity = createAsyncThunk('cart/updateCartQuantity', async ({ proId, quantity }: { proId: string, quantity: number }, { rejectWithValue }) => {
  try {
    if (quantity < 1) {
      return rejectWithValue('Quantity must be at least 1')
    }

    const result = await updateCartItem(proId, quantity)
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not update cart')
    }
    
    return result.result || []
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
    
    return result.result || []
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
    
    return result.result || []
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
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.filter(isValidCartItem)
        state.loading = false
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Add Cart Item
      .addCase(addCartItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.items = action.payload.filter(isValidCartItem)
        state.loading = false
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.items = action.payload.filter(isValidCartItem)
        state.loading = false
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Remove Cart Item
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload.filter(isValidCartItem)
        state.loading = false
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Clear Cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.items = action.payload.filter(isValidCartItem)
        state.loading = false
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer