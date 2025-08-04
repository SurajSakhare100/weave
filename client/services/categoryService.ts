import api from './api';

export async function getCategories() {
  const res = await api.get('/categories');
  return res.data;
}

export async function getHeaderCategories() {
  const res = await api.get('/categories/header');
  return res.data;
}

export async function searchCategories(params: any) {
  const res = await api.get('/categories/search', { params });
  return res.data;
}

export async function getCategoryBySlug(slug: string) {
  const res = await api.get(`/categories/slug/${slug}`);
  return res.data;
}

export async function getCategoryById(id: string) {
  const res = await api.get(`/categories/${id}`);
  return res.data;
}

export async function createCategory(data: any) {
  const res = await api.post('/categories', data);
  return res.data;
}

export async function updateCategory(id: string, data: any) {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
} 