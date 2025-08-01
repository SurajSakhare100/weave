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
    console.log('fetchCart thunk - Starting fetch');
    const data = await getCart()
    console.log('fetchCart thunk - API response:', data);
    
    if (data.success === false) {
      console.log('fetchCart thunk - API returned success: false');
      return rejectWithValue(data.message || 'Could not load cart')
    }
    
    // The server returns { success: true, result: [...], amount: {...} }
    const result = data.result || [];
    console.log('fetchCart thunk - Returning result:', result);
    return result;
  } catch (err: any) {
    console.error('fetchCart thunk - Error:', err);
    return rejectWithValue(err.message || 'Could not load cart')
  }
})

export const addCartItem = createAsyncThunk('cart/addCartItem', async ({ product, quantity, variantSize }: { product: any, quantity: number, variantSize?: string }, { rejectWithValue }) => {
  try {
    // Validate input
    if (!product || !product._id) {
      return rejectWithValue('Invalid product data');
    }

    const result = await addToCart(product, quantity, variantSize)
    
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not add to cart')
    }
    
    // The server returns { success: true, result: [...], amount: {...} }
    return result.result || []
  } catch (err: any) {
    console.error('addCartItem error:', err);
    return rejectWithValue(err.message || 'Could not add to cart')
  }
})

export const updateCartQuantity = createAsyncThunk('cart/updateCartQuantity', async ({ proId, quantity }: { proId: string, quantity: number }, { rejectWithValue }) => {
  try {
    const result = await updateCartItem(proId, quantity)
    if (result.success === false) {
      return rejectWithValue(result.message || 'Could not update cart')
    }
    // The server returns { success: true, result: [...], amount: {...} }
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
    
    // The server returns { success: true, result: [...], amount: {...} }
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
    // The server returns { success: true, result: [...], amount: {...} }
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        console.log('fetchCart.fulfilled - Raw payload:', action.payload);
        console.log('fetchCart.fulfilled - Payload type:', typeof action.payload);
        console.log('fetchCart.fulfilled - Payload length:', Array.isArray(action.payload) ? action.payload.length : 'not array');
        
        // Temporarily less strict filtering for debugging
        const validItems = action.payload.filter(item => {
          const hasProId = item && item.proId;
          const hasItem = item && item.item;
          const isValid = hasProId && hasItem;
          
          if (!hasProId) {
            console.log('Filtered out item - missing proId:', item);
          }
          if (!hasItem) {
            console.log('Filtered out item - missing item data:', item);
          }
          
          return isValid;
        });
        
        console.log('fetchCart.fulfilled - Valid items:', validItems.length);
        console.log('fetchCart.fulfilled - Valid items data:', validItems);
        
        state.items = validItems
        state.loading = false
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addCartItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        // Filter out any items with null proId for safety
        const validItems = action.payload.filter(item => item && item.proId && item.item);
        state.items = validItems
        state.loading = false
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        // Filter out any items with null proId for safety
        const validItems = action.payload.filter(item => item && item.proId && item.item);
        state.items = validItems
        state.loading = false
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        // Filter out any items with null proId for safety
        const validItems = action.payload.filter(item => item && item.proId && item.item);
        state.items = validItems
        state.loading = false
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        // Filter out any items with null proId for safety
        const validItems = action.payload.filter(item => item && item.proId && item.item);
        state.items = validItems
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