import api from './api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Admin approval API functions
export const getPendingVendors = async (params: { skip?: number; limit?: number }) => {
  const response = await api.get('/admin/vendors/pending', { 
    params,
    withCredentials: true // Include cookies
  });
  return response.data;
};

export const approveVendor = async (vendorId: string) => {
  const response = await api.put(`/admin/vendors/${vendorId}/approve`, {}, {
    withCredentials: true
  });
  return response.data;
};

export const rejectVendor = async (vendorId: string, rejectionReason: string) => {
  const response = await api.put(`/admin/vendors/${vendorId}/reject`, { rejectionReason }, {
    withCredentials: true
  });
  return response.data;
};

export const getPendingProducts = async (params: { skip?: number; limit?: number }) => {
  const response = await api.get('/admin/products/pending', { 
    params,
    withCredentials: true
  });
  return response.data;
};

export const approveProduct = async (productId: string) => {
  const response = await api.put(`/admin/products/${productId}/approve`, {}, {
    withCredentials: true
  });
  return response.data;
};

export const rejectProduct = async (productId: string, rejectionReason: string) => {
  const response = await api.put(`/admin/products/${productId}/reject`, { rejectionReason }, {
    withCredentials: true
  });
  return response.data;
};

export const getApprovalStats = async () => {
  const response = await api.get('/admin/approval-stats', {
    withCredentials: true
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard-stats', {
    withCredentials: true
  });
  return response.data;
};

// RTK Query API slice for admin operations
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Category', 'Vendor', 'Product', 'Order'],
  endpoints: (builder) => ({
    // Category endpoints
    getAllTypesCategory: builder.query({
      query: () => '/categories/all-types',
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { categories: [], mainSub: [], subCategory: [] };
      },
      providesTags: ['Category'],
    }),
    getOneCategory: builder.query({
      query: (id) => `/categories/${id}`,
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
        // Check if the body is FormData
        const isFormData = category instanceof FormData;
        
        return {
          url: '/categories',
          method: 'POST',
          body: category,
          // Don't set Content-Type for FormData, let the browser set it automatically
          ...(isFormData && { prepareHeaders: (headers) => {
            headers.delete('Content-Type');
            return headers;
          }})
        };
      },
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, formData }) => {
        // Check if the body is FormData
        const isFormData = formData instanceof FormData;
        
        return {
          url: `/categories/${id}`,
          method: 'PUT',
          body: formData,
          // Don't set Content-Type for FormData, let the browser set it automatically
          ...(isFormData && { prepareHeaders: (headers) => {
            headers.delete('Content-Type');
            return headers;
          }})
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),
    deleteCategory: builder.mutation({
      query: ({ id, folderId }) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
        body: { folderId },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteMainSubCategory: builder.mutation({
      query: (data) => ({
        url: `/categories/${data.id}/main-sub/${data.uni_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    deleteSubCategory: builder.mutation({
      query: (data) => ({
        url: `/categories/${data.id}/sub/${data.uni_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    
    // Vendor endpoints
    getVendors: builder.query({
      query: (params) => ({
        url: '/vendors/admin/list',
        params,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { vendors: [], total: 0 };
      },
      providesTags: ['Vendor'],
    }),
    acceptVendor: builder.mutation({
      query: (vendorData) => ({
        url: '/vendors/accept',
        method: 'POST',
        body: vendorData,
      }),
      invalidatesTags: ['Vendor'],
    }),
    deleteVendor: builder.mutation({
      query: ({ email, vendorId }) => ({
        url: `/vendors/admin/${vendorId}`,
        method: 'DELETE',
        body: { email },
      }),
      invalidatesTags: ['Vendor'],
    }),

    // Order endpoints
    getAllOrders: builder.query({
      query: (params) => ({
        url: '/orders/admin/all',
        params,
      }),
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return { orders: [], total: 0 };
      },
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/admin/${id}`,
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

// Export hooks
export const {
  useGetAllTypesCategoryQuery,
  useGetOneCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteMainSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetVendorsQuery,
  useAcceptVendorMutation,
  useDeleteVendorMutation,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = adminApi; 