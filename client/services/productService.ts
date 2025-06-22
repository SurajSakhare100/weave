import api from './api';

export async function getProducts(params?: any) {
  const res = await api.get('/products', { params });
  return res.data;
}

export async function searchProducts(params: any) {
  const res = await api.get('/products/search', { params });
  return res.data;
}

export async function getProductsByCategory(categorySlug: string, params?: any) {
  const res = await api.get(`/products/category/${categorySlug}`, { params });
  return res.data;
}

export async function getProductBySlug(slug: string) {
  const res = await api.get(`/products/slug/${slug}`);
  return res.data;
}

export async function getProductById(id: string) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function getSimilarProducts(id: string) {
  const res = await api.get(`/products/${id}/similar`);
  return res.data;
}

export async function createProduct(data: any) {
  const res = await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function updateProduct(id: string, data: any) {
  const res = await api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
} 