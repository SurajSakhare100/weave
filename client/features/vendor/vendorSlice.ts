import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Product interface based on the backend data structure
interface Product {
  _id: string
  name: string
  slug: string
  price: number
  mrp: number
  discount: number
  vendorId: string // ObjectId reference to Vendor
  vendor: boolean
  available: string // "true" or "false"
  category: string
  categorySlug?: string
  srtDescription?: string
  description?: string
  seoDescription?: string
  seoKeyword?: string
  seoTitle?: string
  pickup_location?: string
  return: boolean
  cancellation: boolean
  uni_id_1?: string
  uni_id_2?: string
  files: string[] // Array of image filenames
  variant: boolean
  variantDetails: Array<{
    size: string
    price: number
    mrp: number
    stock: number
  }>
  currVariantSize?: string
  createdAt: string
  updatedAt: string
}

// Vendor profile interface
interface VendorProfile {
  _id: string
  name: string
  email: string
  number?: string
  accept: boolean
  bankAccOwner?: string
  bankName?: string
  bankAccNumber?: string
  bankIFSC?: string
  bankBranchName?: string
  bankBranchNumber?: string
  createdAt: string
}

// Pagination interface
interface PaginationData {
  items: any[]
  total: number
  page: number
  limit: number
  pages: number
}

interface VendorState {
  // Authentication
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
  
  // Profile
  profile: VendorProfile | null
  
  // Dashboard
  dashboard: {
    recentProducts: Product[]
    productStats: {
      totalProducts: number
      activeProducts: number
      inactiveProducts: number
    }
    orderStats: {
      totalOrders: number
      totalRevenue: number
      pendingOrders: number
      completedOrders: number
    }
    recentOrders: any[]
  } | null
  
  // Products
  products: PaginationData
  
  // Orders
  orders: PaginationData
}

const initialState: VendorState = {
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
  profile: null,
  dashboard: null,
  products: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  orders: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  }
}

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    // Authentication
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; vendor: VendorProfile }>) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.profile = action.payload.vendor
      state.loading = false
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.profile = null
      state.dashboard = null
      state.products = initialState.products
      state.orders = initialState.orders
      state.error = null
    },
    
    // Profile
    setProfile: (state, action: PayloadAction<VendorProfile>) => {
      state.profile = action.payload
    },
    updateProfile: (state, action: PayloadAction<Partial<VendorProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    
    // Dashboard
    setDashboard: (state, action: PayloadAction<any>) => {
      state.dashboard = action.payload
    },
    
    // Products
    setProducts: (state, action: PayloadAction<PaginationData>) => {
      state.products = action.payload
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.items.unshift(action.payload)
      state.products.total += 1
    },
    updateProduct: (state, action: PayloadAction<{ id: string; data: Partial<Product> }>) => {
      const index = state.products.items.findIndex(p => p._id === action.payload.id)
      if (index !== -1) {
        state.products.items[index] = { ...state.products.items[index], ...action.payload.data }
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products.items = state.products.items.filter(p => p._id !== action.payload)
      state.products.total -= 1
    },
    
    // Orders
    setOrders: (state, action: PayloadAction<PaginationData>) => {
      state.orders = action.payload
    },
    updateOrder: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const index = state.orders.items.findIndex(o => o._id === action.payload.id)
      if (index !== -1) {
        state.orders.items[index] = { ...state.orders.items[index], ...action.payload.data }
      }
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null
    }
  },
})

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  setProfile,
  updateProfile,
  setDashboard,
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setOrders,
  updateOrder,
  setLoading,
  setError,
  clearError
} = vendorSlice.actions

export default vendorSlice.reducer 