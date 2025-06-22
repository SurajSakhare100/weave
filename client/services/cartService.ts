import api from './api';

export async function getCart(userId: string) {
  const res = await api.get(`/users/${userId}/cart`);
  return res.data;
}

export async function addToCart(userId: string, item: any) {
  const res = await api.post(`/users/${userId}/cart`, item);
  return res.data;
}

export async function updateCartItem(userId: string, itemId: string, data: any) {
  const res = await api.put(`/users/${userId}/cart/${itemId}`, data);
  return res.data;
}

export async function removeFromCart(userId: string, itemId: string) {
  const res = await api.delete(`/users/${userId}/cart/${itemId}`);
  return res.data;
} 