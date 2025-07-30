import api from './api';

export async function getProducts(params?: any) {
  try {
    const res = await api.get('/products', { params });
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
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    throw new Error('Failed to fetch product');
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