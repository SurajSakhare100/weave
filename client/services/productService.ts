import api from './api';

interface ProductQueryParams {
  search?: string;
  category?: string;
  availability?: string;
  size?: string;
  colors?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sort?: '-sales' | 'price' | '-price' | 'createdAt' | '-createdAt' | '-discount';
  page?: number;
  limit?: number;
}

export async function getProducts(params?: ProductQueryParams) {
  try {
    console.log('Sending product request with params:', params);
    const res = await api.get('/products', { params });
    console.log('Product response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function searchProducts(params: any) {
  try {
    const res = await api.get('/products/search', { params });
    return res.data;
  } catch (error) {
    console.error('Failed to search products:', error);
    throw new Error('Failed to search products');
  }
}

export async function getProductsByCategory(categorySlug: string, params?: any) {
  try {
    const res = await api.get(`/products/category/${categorySlug}`, { params });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    throw new Error('Failed to fetch products by category');
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function getProductById(id: string) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error: any) {
    console.error('Failed to fetch product by ID:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      const reason = error.response?.data?.reason;
      const message = error.response?.data?.message;
      
      if (reason === 'pending_approval') {
        throw new Error('Product not available - pending approval');
      } else if (message === 'Product not available') {
        throw new Error('Product not available');
      } else {
        throw new Error('Product not found');
      }
    } else if (error.response?.status === 400) {
      throw new Error('Invalid product ID');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch product');
    }
  }
}

export async function getSimilarProducts(id: string) {
  try {
    const res = await api.get(`/products/${id}/similar`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
    throw new Error('Failed to fetch similar products');
  }
}

export async function getFrequentlyBoughtTogether(id: string, limit: number = 4) {
  try {
    const res = await api.get(`/products/${id}/frequently-bought`, { params: { limit } });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch frequently bought together products:', error);
    throw new Error('Failed to fetch frequently bought together products');
  }
}

export async function getComparableProducts(id: string, limit: number = 4) {
  try {
    const res = await api.get(`/products/${id}/comparable`, { params: { limit } });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch comparable products:', error);
    throw new Error('Failed to fetch comparable products');
  }
}

export async function createProduct(data: any) {
  try {
    const res = await api.post('/products', data, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    return res.data;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw new Error('Failed to create product');
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const res = await api.put(`/products/${id}`, data, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    return res.data;
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product');
  }
}

export async function deleteProduct(id: string) {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product');
  }
} 