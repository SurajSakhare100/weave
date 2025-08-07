import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// RTK Query API slice for admin operations
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Category', 'Vendor', 'Product', 'ProductStats', 'Order', 'OrderStats', 'Dashboard', 'Coupon', 'Customer'],
  endpoints: (builder) => ({
    // ==================== DASHBOARD ENDPOINTS ====================
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard-stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return {
          totalOrders: 0,
          totalRevenue: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          returnedOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          recentOrders: 0,
          recentRevenue: 0,
          totalVendors: 0,
          approvedVendors: 0,
          pendingVendors: 0,
          totalProducts: 0,
          approvedProducts: 0,
          pendingProducts: 0,
          recentOrdersList: [],
          dailyRevenue: [],
          topProducts: []
        };
      },
      providesTags: ['Dashboard'],
    }),

    getApprovalStats: builder.query({
      query: () => '/admin/approval-stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return {
          pendingVendors: 0,
          pendingProducts: 0,
          approvedVendors: 0,
          approvedProducts: 0
        };
      },
      providesTags: ['Dashboard'],
    }),

    // ==================== VENDOR ENDPOINTS ====================
    getVendors: builder.query({
      query: (params) => ({
        url: '/vendors/admin/list',
        params: {
          skip: params.skip || 0,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || 'all'
        },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { vendors: [], total: 0 };
      },
      providesTags: ['Vendor'],
    }),

    getVendorById: builder.query({
      query: (id) => `/vendors/admin/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Vendor', id }],
    }),

    getVendorStats: builder.query({
      query: () => '/vendors/admin/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return {
          totalVendors: 0,
          activeVendors: 0,
          pendingVendors: 0,
          suspendedVendors: 0
        };
      },
      providesTags: ['Vendor'],
    }),

    acceptVendor: builder.mutation({
      query: (vendorData) => ({
        url: '/vendors/accept',
        method: 'POST',
        body: vendorData,
      }),
      invalidatesTags: ['Vendor', 'Dashboard'],
    }),

    updateVendor: builder.mutation({
      query: ({ id, vendorData }) => ({
        url: `/vendors/admin/${id}`,
        method: 'PUT',
        body: vendorData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vendor', id }, 'Vendor'],
    }),

    deleteVendor: builder.mutation({
      query: ({ email, vendorId }) => ({
        url: `/vendors/admin/${vendorId}`,
        method: 'DELETE',
        body: { email },
      }),
      invalidatesTags: ['Vendor', 'Dashboard'],
    }),

    rejectVendor: builder.mutation({
      query: ({ vendorId, rejectionReason }) => ({
        url: `/admin/vendors/${vendorId}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Vendor', 'Dashboard'],
    }),

    reapplyVendor: builder.mutation({
      query: (vendorData) => ({
        url: '/vendors/reapply',
        method: 'POST',
        body: vendorData,
      }),
      invalidatesTags: ['Vendor', 'Dashboard'],
    }),

    getVendorProducts: builder.query({
      query: ({ vendorId, params }) => ({
        url: `/vendors/admin/${vendorId}/products`,
        params: {
          skip: params.skip || 0,
          limit: params.limit || 10,
          status: params.status || 'all'
        },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { products: [], total: 0 };
      },
      providesTags: (result, error, { vendorId }) => [{ type: 'Vendor', id: vendorId }],
    }),

    getVendorOrders: builder.query({
      query: ({ vendorId, params }) => ({
        url: `/vendors/admin/${vendorId}/orders`,
        params: {
          skip: params.skip || 0,
          limit: params.limit || 10,
          status: params.status || 'all'
        },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { orders: [], total: 0 };
      },
      providesTags: (result, error, { vendorId }) => [{ type: 'Vendor', id: vendorId }],
    }),

    // ==================== PRODUCT ENDPOINTS ====================
    getAdminProductStats: builder.query({
      query: () => '/admin/products/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return {
          approvalCounts: {
            all: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          },
          vendorCounts: {},
          categoryCounts: {},
          totalProducts: 0,
          recentProducts: 0
        };
      },
      providesTags: ['ProductStats'],
    }),

    getAllProducts: builder.query({
      query: (params) => ({
        url: '/admin/getProducts',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          approvalStatus: params.approvalStatus || 'all',
          category: params.category || '',
          vendor: params.vendor || ''
        },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            products: response.data,
            total: response.total,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            pagination: response.pagination,
            showNot: response.showNot
          };
        }
        return { products: [], total: 0, totalPages: 1 };
      },
      providesTags: ['Product'],
    }),

    getProductById: builder.query({
      query: (id) => `/admin/products/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    getPendingProducts: builder.query({
      query: (params) => ({
        url: '/admin/products/pending',
        params: {
          skip: params.skip || 0,
          limit: params.limit || 10,
        },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { products: [], total: 0 };
      },
      providesTags: ['Product'],
    }),

    approveProduct: builder.mutation({
      query: ({ productId, feedback }) => ({
        url: `/admin/products/approve`,
        method: 'POST',
        body: { productId, feedback },
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }, 'Product', 'Dashboard'],
    }),

    rejectProduct: builder.mutation({
      query: ({ productId, rejectionReason }) => ({
        url: `/admin/products/${productId}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }, 'Product', 'Dashboard'],
    }),

    deleteProduct: builder.mutation({
      query: ({ id, folderId }) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
        body: { folderId },
      }),
      invalidatesTags: ['Product', 'Dashboard'],
    }),

    // ==================== ORDER ENDPOINTS ====================
    getAdminOrderStats: builder.query({
      query: () => '/orders/admin-stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return {
          statusCounts: {
            all: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
            refunded: 0
          },
          paymentCounts: {},
          totalOrders: 0,
          recentOrders: 0
        };
      },
      providesTags: ['OrderStats'],
    }),

    getAllOrders: builder.query({
      query: (params) => ({
        url: '/orders',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || '',
          status: params.status || 'all',
          vendor: params.vendor || '',
          dateFrom: params.dateFrom || '',
          dateTo: params.dateTo || ''
        },
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            orders: response.data,
            total: response.pagination?.total || response.data.length
          };
        }
        return { orders: [], total: 0 };
      },
      providesTags: ['Order'],
    }),

    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    getOrderStats: builder.query({
      query: () => '/orders/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0
        };
      },
      providesTags: ['Order'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status, ...(rejectionReason && { rejectionReason }) },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order', 'Dashboard'],
    }),

    updateOrderToDelivered: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order', 'Dashboard'],
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order', 'Dashboard'],
    }),

    // ==================== CATEGORY ENDPOINTS ====================
    getAllTypesCategory: builder.query({
      query: () => '/admin/categories/all-types',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { categories: [] };
      },
      providesTags: ['Category'],
    }),

    getOneCategory: builder.query({
      query: (id) => `/admin/categories/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation({
      query: (category) => {
        const isFormData = category instanceof FormData;
        
        return {
          url: '/admin/categories',
          method: 'POST',
          body: category,
          ...(isFormData && { 
            prepareHeaders: (headers) => {
              headers.delete('Content-Type');
              return headers;
            }
          })
        };
      },
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation({
      query: ({ id, formData }) => {
        const isFormData = formData instanceof FormData;
        
        return {
          url: `/admin/categories/${id}`,
          method: 'PUT',
          body: formData,
          ...(isFormData && { 
            prepareHeaders: (headers) => {
              headers.delete('Content-Type');
              return headers;
            }
          })
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),

    deleteCategory: builder.mutation({
      query: ({ id, folderId }) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
        body: { folderId },
      }),
      invalidatesTags: ['Category'],
    }),



    addHeaderCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/admin/addHeaderCategory',
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),


    getCustomers: builder.query({
      query: () => '/admin/customers',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { customers: [] };
      },
      providesTags: ['Customer'],
    }),

    getCustomerById: builder.query({
      query: (id) => `/admin/customers/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/admin/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
    
      updateCustomer: builder.mutation({
        query: ({ id, customerData }) => ({
          url: `/admin/customers/${id}`,
          method: 'PUT',
          body: customerData,
        }),
        invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
      }),

      getCustomerOrdersById: builder.query({
      query: (orderId) => `/admin/customers/orders/${orderId}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data.orders;
        }
        return { orders: {}, total: 0 };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerOrders: builder.query({
      query: (id,) => `/admin/customers/${id}/orders`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { orders: [], total: 0 };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),

    getCustomerProducts: builder.query({
      query: (id) => `/admin/customers/${id}/products`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { products: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),

    getCustomerStats: builder.query({
      query: () => '/admin/customers/stats',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { customers: [] };
      },
      providesTags: ['Customer'],
    }),

    getCustomerCoupons: builder.query({
      query: (id) => `/admin/customers/${id}/coupons`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { coupons: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerAddresses: builder.query({
      query: (id) => `/admin/customers/${id}/addresses`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { addresses: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerReviews: builder.query({
      query: (id) => `/admin/customers/${id}/reviews`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { reviews: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerWishlist: builder.query({
      query: (id) => `/admin/customers/${id}/wishlist`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { wishlist: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerCart: builder.query({
      query: (id) => `/admin/customers/${id}/cart`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { cart: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerAddress: builder.query({
      query: (id) => `/admin/customers/${id}/address`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { addresses: [] };
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    

  
  }),
});






// Export all hooks
export const {
  // Dashboard
  useGetDashboardStatsQuery,
  useGetApprovalStatsQuery,
  
  // Vendors
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useGetVendorStatsQuery,
  useAcceptVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useRejectVendorMutation,
  useReapplyVendorMutation,
  useGetVendorProductsQuery,
  useGetVendorOrdersQuery,
  
  // Products
  useGetAdminProductStatsQuery,
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetPendingProductsQuery,
  useApproveProductMutation,
  useRejectProductMutation,
  useDeleteProductMutation,
  
  // Orders
  useGetAdminOrderStatsQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderToDeliveredMutation,
  useDeleteOrderMutation,
  
  // Categories
  useGetAllTypesCategoryQuery,
  useGetOneCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddHeaderCategoryMutation,

  // Customers
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
  // Removed invalid hooks: useGetAllCustomerOrdersQuery, useGetCustomerOrdersQuery
  useGetCustomerProductsQuery,
  useGetCustomerStatsQuery,
  useGetCustomerCouponsQuery,
  useGetCustomerAddressesQuery,
  useGetCustomerReviewsQuery,
  useGetCustomerWishlistQuery,
  useGetCustomerCartQuery,
  useGetCustomerAddressQuery,
  useGetCustomerOrdersByIdQuery,
  useGetCustomerOrdersQuery,
} = adminApi; 